"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
class CreateTokenTable extends base_1.Migration {
    constructor() {
        super(...arguments);
        this.order = 2;
        this.name = "CreateTokenTable";
    }
    get query() {
        return `CREATE TABLE if not exists tokens
        (
            id bigint unsigned auto_increment primary key,
            address varchar(191) not null,
            network_id bigint unsigned not null,
            created_at timestamp null,
            updated_at timestamp null,
            name varchar(128) null,
            symbol varchar(256) null,
            totalSupply varchar(128) null,
            circulatingSupply varchar(128) null,
            owner varchar(255) default '0' null,
            ownerBalance varchar(128) null,
            constraint tokens_address_unique unique (address),
            constraint tokens_network_id_foreign foreign key (network_id) references networks (id)
        ) collate = utf8mb4_unicode_ci;`;
    }
}
exports.default = CreateTokenTable;
//# sourceMappingURL=CreateTokenTable.js.map