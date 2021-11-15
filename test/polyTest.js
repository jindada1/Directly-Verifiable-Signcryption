const Poly = artifacts.require("Poly");

contract('Poly', (accounts) => {

    before(async () => {
        
    });


    it(`Interpolate`, async () => {

        const Poly = await Poly.deployed();

        const X  = [0, 1, 4]
        const Y  = [-1,1, 1]
        const x = 5

        let y = await Poly.Interpolate(X, Y, x);
        
        assert.equal(y, -1, 'ooops');
    });


});