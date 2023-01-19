"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./class/base");
const migrations_1 = __importDefault(require("./migrations"));
const migrate = () => {
    const db_credentials = require('./config/config.js').config.db;
    const db = new base_1.Database(db_credentials, true);
    const items = [];
    for (let x of migrations_1.default)
        items.push(new x);
    db.connect().then(() => {
        base_1.Migrator.run(db, items);
        process.exit();
    });
};
migrate();
//# sourceMappingURL=migrate.js.map