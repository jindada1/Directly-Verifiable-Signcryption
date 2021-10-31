pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "./Secp256k1.sol";

contract Operations {
    function bytesToBytes32(bytes memory b, uint256 offset)
        private
        pure
        returns (bytes32)
    {
        bytes32 out;

        for (uint256 i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    /**
     * @dev mapKey
     * Calculates the address for a public key, then saves the mapping from address to public key.
     * @notice This overload is somewhat simpler to use, but has a higher calldata cost.
     * @param _pubKey - ABI encoded 64 byte public key
     * @return _address - calculated address
     */
    function mapKey(bytes memory _pubKey)
        public
        pure
        returns (address _address)
    {
        require(_pubKey.length == 64, "Invalid public key.");
        return address(bytes20(uint160(uint256(keccak256(_pubKey)))));
    }

    struct Device {
        string name;
        uint32 price;
        bytes owner;
    }
    // mapping(Iotid => Device)
    // recording all the IoT devices in the system
    mapping(uint32 => Device) public IoTDevices;

    // mapping(userKey => mapping(Iotid => money))
    // representing the deposited Ether of a buyer for some IoT device
    mapping(address => mapping(uint32 => uint256)) public deposits;

    struct Auth {
        bytes from;        
        uint256 expire;
        bool right;
    }
    // mapping(Iotid => Device)
    // maintaining all the authorized list for all IoT devices
    mapping(uint32 => mapping(address => Auth)) public accTab;
    uint32 public accTabLength = 0;
    
    // invoked by an IoT owner
    function Register(
        bytes memory Kowner,
        uint32 IoTid,
        string memory name,
        uint32 price
    ) public returns (bool) {
        // require(verify());
        IoTDevices[IoTid] = Device({name: name, price: price, owner: Kowner});
        return true;
    }

    // invoked by an IoT buyer
    function Deposit(bytes memory buyer, uint32 IoTid)
        public
        payable
        returns (bool)
    {
        deposits[mapKey(buyer)][IoTid] = msg.value;
        return true;
    }

    // invoked by an IoT buyer
    function Withdraw(uint32 IoTid) public payable returns (uint256) {
        // require(verify());
        require(
            deposits[msg.sender][IoTid] > 0,
            "buyer has no deposit for the device"
        );

        uint256 amount = deposits[msg.sender][IoTid];
        deposits[msg.sender][IoTid] = 0;
        msg.sender.transfer(amount);
        return amount;
    }

    // invoked by an IoT owner
    function Transfer(
        bytes memory Kowner,
        bytes memory buyer,
        uint32 IoTid
    ) public payable returns (bool) {
        // require(verify());
        require(
            deposits[mapKey(buyer)][IoTid] > 0,
            "buyer has no deposit for the device"
        );
        require(
            equal(IoTDevices[IoTid].owner, Kowner),
            "owner is not the owner of the device"
        );
        IoTDevices[IoTid].owner = buyer;

        address buyerAdd = mapKey(buyer);
        uint256 amount = deposits[buyerAdd][IoTid];
        deposits[buyerAdd][IoTid] = 0;

        address payable owner = address(uint160(mapKey(Kowner)));
        owner.transfer(amount);
        return true;
    }

    function equal(bytes memory a, bytes memory b) private pure returns (bool) {
        return
            keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b)));
    }

    Secp256k1 public curve = new Secp256k1();

    // Costs ~85000 gas, 2x ecmul, 1x ecadd, + small overheads
    function CreateProof(uint256 secret, uint256 message)
        public
        view
        returns (
            uint256[2] memory out_pubkey,
            uint256 out_s,
            uint256 out_e
        )
    {
        Secp256k1.G1Point memory xG = curve.g1mul2(curve.P1(), secret % curve.N());
        out_pubkey[0] = xG.X;
        out_pubkey[1] = xG.Y;
        uint256 k = uint256(keccak256(abi.encodePacked(message, secret))) % curve.N();
        Secp256k1.G1Point memory kG = curve.g1mul2(curve.P1(), k);
        out_e = uint256(
            keccak256(
                abi.encodePacked(
                    out_pubkey[0],
                    out_pubkey[1],
                    kG.X,
                    kG.Y,
                    message
                )
            )
        );
        out_s = curve.submod(k, mulmod(secret, out_e, curve.N()));
    }

    // Costs ~85000 gas, 2x ecmul, 1x ecadd, + small overheads
    function CalcProof(
        uint256[2] memory pubkey,
        uint256 message,
        uint256 s,
        uint256 e
    ) private view returns (uint256) {
        Secp256k1.G1Point memory sG = curve.g1mul2(curve.P1(), s % curve.N());
        Secp256k1.G1Point memory xG = Secp256k1.G1Point(pubkey[0], pubkey[1]);
        Secp256k1.G1Point memory kG = curve.g1add(sG, curve.g1mul2(xG, e));
        return
            uint256(
                keccak256(
                    abi.encodePacked(pubkey[0], pubkey[1], kG.X, kG.Y, message)
                )
            );
    }

    function VerifyProof(
        uint256[2] memory pubkey,
        uint256 message,
        uint256 s,
        uint256 e
    ) private view returns (bool) {
        return e == CalcProof(pubkey, message, s, e);
    }

    function checkK(
        bytes memory pubkey,
        uint256 message,
        bytes memory proof
    ) private view returns (bool) {
        uint256 x = uint256(bytesToBytes32(pubkey, 0));
        uint256 y = uint256(bytesToBytes32(pubkey, 32));
        uint256 s = uint256(bytesToBytes32(proof, 0));
        uint256 e = uint256(bytesToBytes32(proof, 32));

        return VerifyProof([x, y], message, s, e);
    }

    // invoked by an IoT owner or an IoT user
    function Delegate(
        bytes memory _type,
        bytes memory Kfrom,
        uint256 message,
        uint32 IoTid,
        bytes memory Kto,
        bytes memory proofs_to,
        uint256 expire,
        bool right
    ) public returns (bool) {
        require(checkK(Kto, message, proofs_to));
        
        if (equal(_type, "owner")) {
            require(
                equal(IoTDevices[IoTid].owner, Kfrom),
                "pubkey_from is not the owner of device"
            );
        }
        if (equal(_type, "user")) {
            address from = address(uint160(mapKey(Kfrom)));
            require(accTab[IoTid][from].right, "right is not true");
        }
        
        address to = address(uint160(mapKey(Kto)));
        accTab[IoTid][to]= Auth({from: Kfrom, expire: expire, right: right});
        return true;
    }

    event sessionInfo(bytes id, uint32 Iotid);

    function addAccTab(
        uint32 IoTid,
        bytes memory Kfrom,
        bytes memory Kto,
        uint256 expire,
        bool right
    ) public {
        address to = address(uint160(mapKey(Kto)));
        accTab[IoTid][to]=Auth({from: Kfrom, expire: expire, right: right});
        accTabLength += 1;
    }

    // invoked by an IoT user
    function GenerateSessionID(bytes memory Kuser, uint32 IoTid)
        public
        returns (bytes memory sessionId)
    {
        address user = address(uint160(mapKey(Kuser)));
        require(now < accTab[IoTid][user].expire, "already expired");
        sessionId = abi.encodePacked(
            Kuser,
            IoTid,
            accTab[IoTid][user].expire
        );
        emit sessionInfo(sessionId, IoTid);
    }

    // invoked by an IoT owner
    function Revoke(
        bytes memory Kowner,
        bytes memory Kto,
        uint32 IoTid
    ) public {
        // require(verify());
        require(
            equal(IoTDevices[IoTid].owner, Kowner),
            string(abi.encodePacked(Kowner, " is not the owner of ", IoTid))
        );
        Remove(Kto, IoTid);
    }

    function Remove (
        bytes memory Kto,
        uint32 IoTid
    ) public {
        address to = address(uint160(mapKey(Kto)));
        delete accTab[IoTid][to];
        accTabLength -= 1;
    }

    function getAccTabLength() 
        public 
        view 
    returns (uint32) {
        return accTabLength;
    }
}
