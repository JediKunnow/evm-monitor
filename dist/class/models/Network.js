"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
class Network {
    constructor(params) {
        this.id = params.id;
        this.wss = params.wss;
        this.db_id = params.db_id;
        this.name = params.name;
        this.scan_api = params.scan_api;
        this.routers = params.routers;
        this.common = params.common;
    }
}
exports.Network = Network;
//# sourceMappingURL=Network.js.map