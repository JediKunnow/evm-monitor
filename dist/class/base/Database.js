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
exports.Database = void 0;
const promise_1 = require("mysql2/promise");
const utils_1 = require("../utils");
class Database {
    constructor(params, lazyLoad) {
        this.host = params.host;
        this.user = params.user;
        this.password = params.password;
        this.name = params.database;
        this.db = null;
        this.error = null;
        if (!lazyLoad) {
            this.connect().then(() => {
                console.log(`${utils_1.Colors.BRIGHT_BLUE}[DATABASE] MySQL Connected.${utils_1.Colors.RESET}`);
            });
        }
    }
    get connection() {
        return this.db != null ? this.db : null;
    }
    get f() {
        return promise_1.format;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = yield (0, promise_1.createConnection)({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.name,
                multipleStatements: true
            });
            console.log(`${utils_1.Colors.BRIGHT_BLUE}[DATABASE] MySQL Connected.${utils_1.Colors.RESET}`);
        });
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db != null) {
                let [r, f] = yield this.db.query(query);
                return r;
            }
            return null;
        });
    }
    insert(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db != null) {
                let [r, f] = yield this.db.query(query);
                return r.insertId;
            }
            return null;
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map