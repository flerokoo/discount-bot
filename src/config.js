module.exports = {
    dbPath: "./db/sqlite",
    logPath: "./logs/",
    // updateInterval: 6 * 60 * 60 * 1000, // 6 hours in ms
    updateInterval: 10000, //ms
    supportedShops: [
        "street-beat.ru",
        "lamoda.ru",
        "sneakerhead.ru",
        "asos.com"
    ],
    botToken: process.env.BOT_TOKEN
};