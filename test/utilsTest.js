const utils = require("../utils")

it(`encryption & decryption`, async () => {

    let M = utils.asciiToHex("Hello Bob")

    let C = '0x5dd7c19c10fe39833ddba89c4637d2616b8ad6ff3e99acdf9435fedd66fb4efa'
    let k = '0x5dd7c19c10fe39833ddba89c4637d2616b8ad6ff3e99ac97f15992b246b92198'

    assert.equal(utils.decrypt(C, k), M, 'ooops');
});


it(`XOR`, async () => {
    let msg = '0x48656c6c6f20426f62';
    let key = '0xb86ccf378e5a5caa3df06cc42a85d4e05bcf7956db5a57801d35c14e8af31458';

    let msg_key = utils.encrypt(msg, key);
    
    // console.log({msg_key});
    
    // assert.deepEqual(1, 1, 'ooops');
});

it(`drivePub`, async () => {

    let r = "0x1f949ca7702deff94c4673db6f70296d7fcc9fd1bbc5fe013c66ff6207bd5e9d";

    let R = [
        '0xae88579a88f74edfc374475711bf0622a0aab3a1d27a5c7602f13969e7fdd8f3',
        '0x82478be276e0400cf59159d364fda31901c78410904e23665c1dc46ce3adc95a'
    ]

    let DR = utils.drivePub(r)
    // console.log(DR)

    assert.deepEqual(DR, R, 'ooops');
});


it(`addHex`, async () => {

    let R = [
        '0xae88579a88f74edfc374475711bf0622a0aab3a1d27a5c7602f13969e7fdd8f3',
        '0x82478be276e0400cf59159d364fda31901c78410904e23665c1dc46ce3adc95a'
    ]
    
    let sum = utils.eccAddHex(R[0], R[1])
    // console.log(sum.toString(16))

    assert.deepEqual(1, 1, 'ooops');
});


it(`mulHex`, async () => {

    let R = [
        '0xae88579a88f74edfc374475711bf0622a0aab3a1d27a5c7602f13969e7fdd8f3',
        '0x82478be276e0400cf59159d364fda31901c78410904e23665c1dc46ce3adc95a'
    ]

    let product = utils.eccMulHex(R[0], R[1])
    // console.log(product.toString(16))

    assert.deepEqual(1, 1, 'ooops');
});


it('ecc', async () => {
    
    let Bob = utils.keypair(1)
    let r   = "0x1f949ca7702deff94c4673db6f70296d7fcc9fd1bbc5fe013c66ff6207bd5e9d";

    let w   = Bob.prikey
    let x = "0x1a0aab3a1d27a5c7602f13969e7fdd8f3"
    let R   = utils.drivePub(r)
    let W   = Bob.pubkey


    let wR = utils.mulPoint(R, w)
    let Wr = utils.mulPoint(W, r)
    assert.deepEqual(wR, Wr, 'wR != Wr');


    let R_W = utils.addPoints(R, W)
    let r_w = utils.eccAddHex(r, w)
    let G_r_w = utils.drivePub(r_w)
    assert.deepEqual(R_W, G_r_w, 'R_W != G_r_w');


    let Wx = utils.mulPoint(W, x)
    let wx = utils.eccMulHex(w, x)
    let Gwx = utils.drivePub(wx)
    assert.deepEqual(Wx, Gwx, 'Wx != Gwx');


    let R_Wx = utils.addPoints(R, utils.mulPoint(W, x))
    let r_wx = utils.eccAddHex(r, utils.eccMulHex(w, x))
    let G_r_wx = utils.drivePub(r_wx)
    assert.deepEqual(R_Wx, G_r_wx, 'R_Wx != G_rwx');
});
