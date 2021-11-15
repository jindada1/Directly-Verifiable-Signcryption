pragma solidity ^0.5.17;

contract Poly {

    /**
     * @notice Implementation of lagrange interpolation formula
     * @param X   - .
     * @param Y   - known n points (X[0], Y[0]), ... , (X[n-1], Y[n-1]).
     * @param x   - .
     * @return y  - calc y corresponding to given x.
     */
    function InterpolateInt(
        int256[] memory X,
        int256[] memory Y,
        int256 x
    ) public pure returns (int256 y) {
        require(X.length == Y.length);
        y = 0;
        for (uint256 i = 0; i < Y.length; i++) {
            int256 b = Y[i];
            for (uint256 j = 0; j < X.length; j++) {
                if (i == j) continue;
                b = (b * (x - X[j])) / (X[i] - X[j]);
            }
            y += b;
        }
    }

    /**
     * @notice Implementation of lagrange interpolation formula
     * @param X   - [整数部分, 小数部分, 整数部分，小数部分, ..., 整数部分, 小数部分].
     * @param Y   - [整数部分, 小数部分, 整数部分，小数部分, ..., 整数部分, 小数部分],
     *              point is ( double(X[0],X[1]), double(Y[0],Y[1]) )
     * @param x   - [整数部分, 小数部分].
     * @return y  - calc y corresponding to given x.
     */
    function Interpolate(
        int256[] memory X,
        int256[] memory Y,
        int256[2] memory x
    ) public view returns (int256[2] memory y) {
        require(X.length == Y.length);
        require(X.length % 2 == 0);

        y = [int256(0), int256(0)];

        for (uint256 i = 0; i < Y.length; i += 2) {
            // b = Y[i];
            int256[2] memory b = [Y[i], Y[i + 1]];

            for (uint256 j = 0; j < X.length; j += 2) {
                if (i == j) continue;
                // b = b * (x - X[j]) / (X[i] - X[j]);
                int256[2] memory d_X_j = [X[j], X[j + 1]];
                int256[2] memory d_X_i = [X[i], X[i + 1]];
                b = DoubleMul(
                    b,
                    DoubleDiv(DoubleSub(x, d_X_j), DoubleSub(d_X_i, d_X_j))
                );
            }
            y = DoubleAdd(y, b);
        }

    }

    function setPrecise(int p) public {
        dot = p;
    }

    // precision
    int private dot = 100;

    function Convert(int256[2] memory n)
        public
        view
        returns (int256 r)
    {
        require(!(n[0] < 0 && n[1] < 0));
        r = n[0] * dot + (n[0] < 0 ? -n[1] : n[1]);
    }

    function Normalize(int256 n)
        public
        view
        returns (int256[2] memory r)
    {
        r = [n / dot, n > -dot ? n % dot : -n % dot];
    }

    function DoubleAdd(int256[2] memory x, int256[2] memory y)
        public
        view
        returns (int256[2] memory z)
    {
        int256 sum = Convert(x) + Convert(y);
        z = Normalize(sum);
    }

    function DoubleSub(int256[2] memory x, int256[2] memory y)
        public
        view
        returns (int256[2] memory z)
    {
        int256 sum = Convert(x) - Convert(y);
        z = Normalize(sum);
    }

    function DoubleDiv(int256[2] memory x, int256[2] memory y)
        public
        view
        returns (int256[2] memory z)
    {
        int256 quot = Convert(x) * dot / Convert(y);
        z = Normalize(quot);
    }

    function DoubleMul(int256[2] memory x, int256[2] memory y)
        public
        view
        returns (int256[2] memory z)
    {
        int256 quot = Convert(x) * Convert(y) / dot;
        z = Normalize(quot);
    }
}
