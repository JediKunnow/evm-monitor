const config = {
    log: false,
    resolver: {
        chunk_size: 100
    },
    db: {
        host: "",
        user: "",
        password: "",
        database: ""
    },
    network: 'polygon',
    networks: require('./networks').networks
}

module.exports = { config };