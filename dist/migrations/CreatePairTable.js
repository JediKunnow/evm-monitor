"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../class/base");
class CreatePairTable extends base_1.Migration {
    constructor() {
        super(...arguments);
        this.order = 3;
        this.name = "CreatePairTable";
    }
    get query() {
        return `create table pairs
        (
            id          bigint unsigned auto_increment primary key,
            address     varchar(191)    not null,
            network_id  bigint unsigned not null,
            created_at  timestamp       not null,
            name        varchar(250)    null,
            symbol      varchar(32)     null,
            token0      varchar(191)    null,
            token1      varchar(191)    null,
            reserve0    varchar(191)    null,
            reserve1    varchar(191)    null,
            factory     varchar(191)    null,
            totalSupply varchar(128)    null,
            constraint pairs_networks_id_fk foreign key (network_id) references networks (id)
        );`;
    }
}
exports.default = CreatePairTable;
//# sourceMappingURL=CreatePairTable.js.map