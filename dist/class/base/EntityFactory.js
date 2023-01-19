"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFactory = void 0;
const entities_1 = require("../entities");
class EntityFactory {
    static issue(type, data) {
        switch (type) {
            case 'Token':
                return new entities_1.Token(data);
            case 'Pair':
                return new entities_1.Pair(data);
            case 'MasterChef':
                return new entities_1.MasterChef(data);
        }
    }
}
exports.EntityFactory = EntityFactory;
//# sourceMappingURL=EntityFactory.js.map