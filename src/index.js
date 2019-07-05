let axios = require("axios").default;
let cheerio = require("cheerio");
let puppeteer = require("puppeteer");
let sqlite3 = require("sqlite3").verbose();
let config = require("./config")
let getDbAdapter = require("./db/sqlite-adapter");
let { EventEmitter } = require("events");
let Crawler = require("./crawler")
let { createDefaultParser, getDefaultParser } = require("./parser/parse-manager")
let startBot = require("./bot")
let loadAndParse = require("./util/load-and-parse")

let mediator = new EventEmitter();

puppeteer.launch().then(browser => {
    createDefaultParser(browser);
    return getDbAdapter(mediator);
}).then(async db => {
    let crawler = new Crawler(mediator, db).start();
    startBot(mediator, db);
}).catch(err => {
    throw new Error(err)
});

