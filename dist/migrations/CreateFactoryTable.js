"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
class CreateNetworkTable extends base_1.Migration {
    constructor() {
        super(...arguments);
        this.order = 4;
        this.name = "CreateFactoryTable";
    }
    get query() {
        return `create table factories
        (
            id          bigint unsigned auto_increment primary key,
            name        varchar(191)            not null,
            network_id  bigint unsigned         not null,
            address     varchar(191) default '' null,
            created_at  timestamp default CURERENT               null,
            updated_at  timestamp               null
        ) collate = utf8mb4_unicode_ci;`;
    }
}
exports.default = CreateNetworkTable;
//# sourceMappingURL=CreateFactoryTable.js.map