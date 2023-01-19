"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairShape = void 0;
class PairShape {
    constructor(params) {
        this.address = params.address;
        this.network_id = params.network_id;
        this.created_at = params.created_at;
        this.id = params.id;
        this.name = params.name;
        this.symbol = params.symbol;
        this.token0 = params.token0;
        this.token1 = params.token1;
        this.reserve0 = params.reserve0;
        this.reserve1 = params.reserve1;
        this.factory = params.factory;
        this.totalSupply = params.totalSupply;
    }
}
exports.PairShape = PairShape;
//# sourceMappingURL=PairShape.js.map