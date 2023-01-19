const config = {
    log: false,
    resolver: {
        chunk_size: 100
    },
    db: {
        host: "127.0.0.1",
        user: "root",
        password: "Filippo@96",
        database: "evm_monitor"
    },
    network: 'bsc',
    networks: require('./networks').networks
}

module.exports = { config };