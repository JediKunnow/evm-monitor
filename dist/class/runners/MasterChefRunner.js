"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterChefRunner = void 0;
const base_1 = require("../base");
const utils_1 = require("../utils");
class MasterChefRunner extends base_1.Runner {
    run() {
        if (this.subject.shape.verified)
            return;
        utils_1.BlockExplorer.is_contract_verified(this.network, this.subject.shape.address).then((is_verified) => {
            if (!is_verified)
                return;
            this.subject.markAsVerified(this.db).then(() => {
                console.log(`${utils_1.Colors.BRIGHT_CYAN}[${this.constructor.name}] ${this.subject.shape.address} marked as verified. [${new Date().toLocaleTimeString()}]${utils_1.Colors.RESET}`);
                this.subject.shape.verified = true;
            });
        }).catch((err) => {
            console.log(`${utils_1.Colors.RED}[${this.constructor.name}] Error: ${err}`);
        });
    }
}
exports.MasterChefRunner = MasterChefRunner;
//# sourceMappingURL=MasterChefRunner.js.map