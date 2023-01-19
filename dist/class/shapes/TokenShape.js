"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenShape = void 0;
;
class TokenShape {
    constructor(params) {
        this.id = params.id;
        this.address = params.address;
        this.network_id = params.network_id;
        this.created_at = params.created_at;
        this.name = params.name;
        this.symbol = params.symbol;
        this.totalSupply = params.totalSupply;
        this.circulatingSupply = params.circulatingSupply;
        this.owner = params.owner;
        this.ownerBalance = params.ownerBalance;
        this.score = params.score;
    }
}
exports.TokenShape = TokenShape;
//# sourceMappingURL=TokenShape.js.map