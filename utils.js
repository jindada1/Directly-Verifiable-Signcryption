const account_prikeys = [
    "0xf086cff7f8f85b80d33aa34eb1f912407b613a63aaede6ff996ae79e037ed7a7",
    "0xccbd180f02d4ab3a824343d5d17cd408ca68b72d19a4a779386190fcac4c562d",
    "0xb99a4547a5c9a8e0af80b773ad0845042f2a781658289f1df05ea45e3ce25b0d",
    "0x7420c9c0b000b315908b7c41aa40c3f16f93a723b0ecd1749f27b7967ff04051",
    "0x2515b67a2cb7620c5a739807000afd585f0e5af966c69c2b8482e76caae71c77",
    "0x483c09f1534f19d3cb36a7190ac416d335387512eb24435b50e27a0d6f813f8b",
    "0x476937255b66dde9b1b9041364534da3770626cdbff3f1e11fee7f2f5a1e63e1",
    "0x5ff0422bd4e1573016d3c368bab8f0f4713c80e8807ee917ce59ff513a723c64",
    "0x5435a572d7c6bf2c1b016ba47d666fd98e7fdd07a123312fcf88ba1a67a9081c",
    "0xf822ccafd7e18820953aa71189b95b8e6f04d8e7be522a81c6f65a1e03d6f821",
]

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const asciiToHex = function (str) {
    if (!str)
        return "0x00";
    var hex = "";
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    return "0x" + hex;
};

/**
 * Should be called to get hex representation (prefixed by 0x) of decimal number string
 *
 * @method decToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const decToHex = function (str) {
    var dec = str.toString().split(''), sum = [], hex = ["0x"], i, s
    while (dec.length) {
        s = 1 * dec.shift()
        for (i = 0; s || i < sum.length; i++) {
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while (sum.length) {
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}

var EC = require('elliptic').ec;
var curve = new EC('secp256k1');

/**
 * Should be called to get public key associated with input private key using 'Secp256k1' elliptic curve
 *
 * @method drivePub
 * @param {String} prikey input private key
 * @returns {Array} hex representation of pubkey.x + pubkey.y
 */
const drivePub = function(prikey) {
    if(prikey.startsWith('0x')){
        prikey = prikey.slice(2);
    }
    var key = curve.keyFromPrivate(prikey)

    var pubPoint = key.getPublic();
    var x = pubPoint.getX().toString('hex').padStart(64, '0');
    var y = pubPoint.getY().toString('hex').padStart(64, '0');

    return ["0x" + x, "0x" + y];
};


var crypto = require("crypto");

/**
 * Generate random bytes and format to hex
 *
 * @method randomBytes
 * @param {Number} bytes byte length of random hex string
 * @returns {String} hex string
 */
const randomBytes = function(bytes = 32) {
    var hex = crypto.randomBytes(bytes).toString('hex');
    return "0x" + hex;
};


module.exports = {
    prikeys: account_prikeys,
    drivePub,
    decToHex,
    asciiToHex,
    bnToHex: (bn) => decToHex(bn.toString()),
    randomBytes
};
