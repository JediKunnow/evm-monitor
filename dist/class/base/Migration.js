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
exports.Migrator = exports.Migration = void 0;
class Migration {
}
exports.Migration = Migration;
class Migrator {
    static run(db, migrations) {
        migrations.sort((a, b) => {
            if (!a.order || !b.order)
                return 0;
            return a.order - b.order;
        }).map((m) => __awaiter(this, void 0, void 0, function* () {
            console.log("Migrating " + m.name);
            db.query(m.query).then(r => console.log);
        }));
        console.log("Migrations Done.");
    }
}
exports.Migrator = Migrator;
//# sourceMappingURL=Migration.js.map