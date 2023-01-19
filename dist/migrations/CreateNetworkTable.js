"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
class CreateNetworkTable extends base_1.Migration {
    constructor() {
        super(...arguments);
        this.order = 1;
        this.name = "CreateNetworkTable";
    }
    get query() {
        return `create table if not exists networks
        (
            id         bigint unsigned auto_increment primary key,
            name       varchar(191)            not null,
            chain_id   int                     not null,
            rpc        varchar(191) default '' null,
            wss        varchar(191) default '' null,
            explorer   varchar(191) default '' null,
            status     tinyint(1)   default 0  not null,
            created_at timestamp               null,
            updated_at timestamp               null
        ) collate = utf8mb4_unicode_ci;`;
    }
}
exports.default = CreateNetworkTable;
//# sourceMappingURL=CreateNetworkTable.js.map