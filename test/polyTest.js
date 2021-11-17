const Poly = artifacts.require("Poly.sol");

contract('Poly', (accounts) => {

    const toNum = bn => bn.toNumber()
    
    const toFloat = (ns, precise = 2) => {
        let str = ns[1] > 0 ? `${ns[0]}.` : `${-ns[0]}.`
        let dec = ns[1] < 0? -ns[1] : ns[1]
        str += dec.toString().padStart(precise, '0')
        return parseFloat(str).toFixed(precise)
    }

    it(`InterpolateInt`, async () => {
        const poly = await Poly.deployed();

        const X = [0, 1, 4]
        const Y = [-1, 1, 1]
        const x = 6

        let y = await poly.InterpolateInt(X, Y, x);
        // console.log(y.toString());
        assert.equal(y.toNumber(), -4, 'x = 6');
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

        const x = [5, 06]
        const y = [-6, 60]

        let res = await poly.DoubleAdd(x, y);

        assert.equal(toFloat(res), -1.54, `${toFloat(x)} + ${toFloat(y)}`);
    });

    it(`Sub`, async () => {
        const poly = await Poly.deployed();

        const x = [0, 56]
        const y = [0, -60]

        let res = await poly.DoubleSub(x, y);

        assert.deepEqual(res.map(toNum), [1, 16], '0.56 - -0.60');
    });

    it(`Mul`, async () => {
        const poly = await Poly.deployed();

        const x = [10000, 16]
        const y = [0, 50]

        let res = await poly.DoubleMul(x, y);

        assert.deepEqual(res.map(toNum), [5000, 8], '10000.16 * 0.50');
    });

    it(`Div`, async () => {
        const poly = await Poly.deployed();

        const x = [1, 16]
        const y = [1, 30]

        let res = await poly.DoubleDiv(x, y);

        assert.deepEqual(res.map(toNum), [0, 89], '1.16 / 1.30');
    });

    it(`Interpolate`, async () => {
        const poly = await Poly.deployed();

        const X = [0, 0, 1, 0, 4, 0]
        const Y = [-1, 0, 1, 0, 1, 0]
        const x = [2, 50]

        precise_result = []

        for (const p of [2, 3, 4]) {
            let pow = 10 ** p

            // calc y where x = 2.5
            await poly.setPrecise(pow);
            let d = await poly.Interpolate(X, Y, [2, parseInt(pow * 0.5)]);
            
            precise_result.push({
                precise: 1 / pow,
                result: toFloat(d.map(toNum), p),
                right: 2.125
            })
        }

        console.table(precise_result);
    });

});