var Main = artifacts.require("Main.sol");
var Secp256k1 = artifacts.require("Secp256k1.sol");

module.exports = function (deployer) {
    deployer.deploy(Secp256k1);
    deployer.link(Secp256k1, Main);
    deployer.deploy(Main);
};