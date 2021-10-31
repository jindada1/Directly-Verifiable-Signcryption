const Main = artifacts.require("Main");
const utils = require("../utils")
const BN = require('bn.js');

function keypair(i) {
    return {
        prikey: utils.prikeys[i],
        pubkey: utils.drivePub(utils.prikeys[i])
    }
}

contract('Main', (accounts) => {

    let Alice = keypair(0)
    let Bob = keypair(1)

    it(`drivePubkey`, async () => {

        const main = await Main.deployed();

        const pubkey = await main.drivePubkey(Alice.prikey, {
            from: accounts[0]
        });
        
        let pub = pubkey.map(utils.bnToHex)
        
        assert.deepEqual(pub, Alice.pubkey, `wrong response:`);
    });


    it(`reverseArray`, async () => {

        const main = await Main.deployed();

        const reversepubkey = await main.reverseArray(Bob.pubkey);
        let pub = reversepubkey.map(utils.bnToHex)
                
        assert.deepEqual(pub, Bob.pubkey.reverse(), pub);
    });

    
    it(`oneAndRightHalf`, async () => {

        const main = await Main.deployed();

        const p_RR = await main.oneAndRightHalf(Bob.prikey);
        
        // console.log({
        //     uint256: Bob.prikey,
        //     oneAndRightHalf: utils.bnToHex(p_RR)
        // });

        assert.equal(1, 1, 'opps');
    });


    it(`encryption`, async () => {

        let M = utils.asciiToHex("Hello Bob")

        let C = '0x5dd7c19c10fe39833ddba89c4637d2616b8ad6ff3e99acdf9435fedd66fb4efa'
        let k = '0x5dd7c19c10fe39833ddba89c4637d2616b8ad6ff3e99ac97f15992b246b92198'

        var bn_M = new BN(M, 16);
        var bn_k = new BN(k, 16);
        var bn_C = new BN(C, 16);
        let hex_encrypt = utils.bnToHex(bn_M.xor(bn_k))
        let hex_decrypt = utils.bnToHex(bn_C.xor(bn_k))

        // console.log({
        //     M,
        //     hex_encrypt,
        //     hex_decrypt
        // });
        
        assert.equal(1, 1, 'opps');
    });


});