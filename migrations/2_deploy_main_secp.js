var MainSecp = artifacts.require("MainSecp.sol");
var Secp256k1 = artifacts.require("Secp256k1.sol");

module.exports = function (deployer) {
    deployer.deploy(Secp256k1);
    deployer.link(Secp256k1, MainSecp);
    deployer.deploy(MainSecp);
};