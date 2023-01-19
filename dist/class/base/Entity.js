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
exports.Entity = void 0;
class Entity {
    constructor({ shape, abi, required, table }) {
        this.shape = shape;
        this.fields = Object.getOwnPropertyNames(shape);
        this.abi = abi;
        this.required = required;
        this.table = table;
    }
    get id() { return this.shape.id; }
    setTable(name) { this.table = name; }
    create(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.should_save)
                return null;
            let data = Array();
            let holders = new Array();
            let names = Array();
            this.fields.forEach(f => {
                if (f != "id" && this.shape[f]) {
                    data.push(this.shape[f]);
                    names.push(f.toString());
                    holders.push("?");
                }
            });
            let marks = "(" + holders.join(", ") + ")";
            let q = db.f("INSERT IGNORE INTO " + this.table + "(" + names.join(", ") + ") VALUES " + marks, data);
            let result = yield db.insert(q);
            if (result != null)
                this.shape.id = result;
            return result;
        });
    }
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.shape.id)
                throw new Error("You must create an Entity before to save it.");
            let data = Array();
            let fields = this.fields.map(f => {
                if (f != "id") {
                    data.push(this.shape[f]);
                    return f.toString().concat(" = ?");
                }
            }).filter(attr => { return attr !== undefined; }).join(", ");
            data.push(this.id);
            let q = db.f("UPDATE IGNORE " + this.table + " SET " + fields + " WHERE id=?", data);
            yield db.query(q);
        });
    }
}
exports.Entity = Entity;
//# sourceMappingURL=Entity.js.map