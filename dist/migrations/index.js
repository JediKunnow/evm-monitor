"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CreateTokenTable_1 = __importDefault(require("./CreateTokenTable"));
const CreateNetworkTable_1 = __importDefault(require("./CreateNetworkTable"));
const CreatePairTable_1 = __importDefault(require("./CreatePairTable"));
const CreateFactoryTable_1 = __importDefault(require("./CreateFactoryTable"));
const CreateMasterChefTable_1 = __importDefault(require("./CreateMasterChefTable"));
exports.default = [
    CreateNetworkTable_1.default,
    CreateTokenTable_1.default,
    CreatePairTable_1.default,
    CreateFactoryTable_1.default,
    CreateMasterChefTable_1.default
];
//# sourceMappingURL=index.js.map