"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
class CreateMasterChefTable extends base_1.Migration {
    constructor() {
        super(...arguments);
        this.order = 5;
        this.name = "CreateMasterChefTable";
    }
    get query() {
        return `CREATE TABLE if not exists masterchefs
        (
            id bigint unsigned auto_increment primary key,
            address varchar(191) not null,
            network_id bigint unsigned not null,
            created_at timestamp null,
            updated_at timestamp null,
            owner varchar(255) default '0' null,
            constraint masterchefs_network_id_foreign foreign key (network_id) references networks (id)
        ) collate = utf8mb4_unicode_ci;`;
    }
}
exports.default = CreateMasterChefTable;
//# sourceMappingURL=CreateMasterChefTable.js.map