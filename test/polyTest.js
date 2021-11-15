const Poly = artifacts.require("Poly.sol");

contract('Poly', (accounts) => {

    const toNum = bn => bn.toNumber()

    it(`InterpolateInt`, async () => {
        const poly = await Poly.deployed();

        const X = [0, 1, 4]
        const Y = [-1, 1, 1]
        const x = 6

        let y = await poly.InterpolateInt(X, Y, x);
        // console.log(y.toString());
    });

    it(`Pconvert`, async () => {
        const poly = await Poly.deployed();
        const x = [-5, 6]

        let res = await poly.Convert(x);
        // console.log(res.toString());
        assert.equal(toNum(res), -506, 'convert([-5, 6])');
    });

    it(`Add`, async () => {
        const poly = await Poly.deployed();

        const x = [5, 60]
        const y = [5, 60]

        let res = await poly.DoubleAdd(x, y);

        assert.deepEqual(res.map(toNum), [11, 20], '5.6 + 5.6');
    });

    it(`Add`, async () => {
        const poly = await Poly.deployed();

        const x = [5, 06]
        const y = [-5, 60]

        let res = await poly.DoubleAdd(x, y);

        assert.deepEqual(res.map(toNum), [0, -54], '5.06 + -5.60');
    });

    it(`Add`, async () => {
        const poly = await Poly.deployed();

        const x = [5, 06]
        const y = [-6, 60]

        let res = await poly.DoubleAdd(x, y);

        assert.deepEqual(res.map(toNum), [-1, 54], '5.06 + -6.60');
    });

    it(`Sub`, async () => {
        const poly = await Poly.deployed();

        const x = [0, 56]
        const y = [0, -60]

        let res = await poly.DoubleSub(x, y);

        assert.deepEqual(res.map(toNum), [1, 16], '0.56 - -0.60');
    });

    it(`Sub`, async () => {
        const poly = await Poly.deployed();

        const x = [0, -56]
        const y = [0, 30]

        let res = await poly.DoubleSub(x, y);

        assert.deepEqual(res.map(toNum), [0, -86], '-0.56 - 0.30');
    });

    it(`Sub`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [2, 30]

        let res = await poly.DoubleSub(x, y);

        assert.deepEqual(res.map(toNum), [-1, 14], '1.16 - 2.30');
    });

    it(`Sub`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [1, 30]

        let res = await poly.DoubleSub(x, y);

        assert.deepEqual(res.map(toNum), [0, -14], '1.16 - 1.30');
    });

    it(`Div`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [1, 30]

        let res = await poly.DoubleDiv(x, y);

        assert.deepEqual(res.map(toNum), [0, 89], '1.16 / 1.30');
    });

    it(`Div`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [-1, 30]

        let res = await poly.DoubleDiv(x, y);

        assert.deepEqual(res.map(toNum), [0, -89], '1.16 / -1.30');
    });

    it(`Mul`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [-1, 30]

        let res = await poly.DoubleMul(x, y);

        assert.deepEqual(res.map(toNum), [-1, 50], '1.16 * -1.30');
    });

    it(`Mul`, async () => {
        const poly = await Poly.deployed();

        const x = [10000, 16]
        const y = [0, 50]

        let res = await poly.DoubleMul(x, y);

        assert.deepEqual(res.map(toNum), [5000, 8], '10000.16 * 0.50');
    });

    it(`Interpolate`, async () => {
        const poly = await Poly.deployed();

        const X = [0, 0, 1, 0, 4, 0]
        const Y = [-1, 0, 1, 0, 1, 0]
        const x = [2, 50]

        for (const p of [100, 1000, 10000, 100000]) {
            await poly.setPrecise(p);
            let d = await poly.Interpolate(X, Y, [2, parseInt(p/2)]);
            console.log(p, d.map(toNum));
        }
    });

});