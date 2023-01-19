"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = void 0;
class Factory {
    constructor({ id, name, address, created_at }) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.created_at = new Date(created_at);
    }
    static get(db, address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let r = yield db.query(`SELECT * from ${Factory.table} WHERE name="${address}" LIMIT 1`);
                if (r === null || r.length == 0)
                    return null;
                return new Factory({
                    id: r[0]['id'],
                    name: r[0]['name'],
                    address: r[0]['address'],
                    created_at: r[0]['created_at']
                });
            }
            catch (err) {
                console.log(err);
                return null;
            }
        });
    }
    static all(db) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield db.query(`SELECT * from ${Factory.table}`);
            if (r === null)
                return [];
            let f = [];
            for (let x of r)
                f.push(new Factory({
                    id: x['id'],
                    name: x['name'],
                    address: x['address'],
                    created_at: x['created_at']
                }));
            return f;
        });
    }
}
exports.Factory = Factory;
Factory.table = "factories";
Factory.ABI = require('../../abis/Factory.json').abi;
//# sourceMappingURL=Factory.js.map