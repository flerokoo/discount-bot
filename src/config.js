module.exports = {
    dbPath: "./db/sqlite",
    updateInterval: 24 * 60 * 60 * 1000, //ms
    supportedShops: [
        "street-beat.ru"
    ],
    botToken: process.env.BOT_TOKEN
}
