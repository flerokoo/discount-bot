module.exports = {
    dbPath: "./db/",
    dbName: "sqlite.db",
    logPath: "./logs/",
    updateInterval: 6 * 60 * 60 * 1000, // 6 hours in ms,
    // updateInterval: 10000, //ms
    crawlingInterval: "* * */8 * * *", //every 8 hours
    // crawlingInterval: "*/10 * * * * *", // every ten seconds
    supportedShops: [
        "street-beat.ru",
        "lamoda.ru",
        "sneakerhead.ru",
        "asos.com"
    ],
    botToken: process.env.BOT_TOKEN
};