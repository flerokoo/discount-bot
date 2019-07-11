const puppeteer = require("puppeteer");
const getDbAdapter = require("./db/sqlite-adapter");
const { EventEmitter } = require("events");
const Crawler = require("./crawler");
const { createDefaultParser } = require("./parser/parse-manager");
const startBot = require("./bot");

const mediator = new EventEmitter();

const options = {
    args: ["--no-sandbox"],
    headless: true
};

puppeteer.launch(options).then(browser => {
    createDefaultParser(browser);
    return getDbAdapter(mediator);
}).then(async db => {
    startBot(mediator, db);
    // eslint-disable-next-line no-unused-vars
    let crawler = new Crawler(mediator, db).start();
}).catch(err => {
    console.log("Failed to launch app");
    console.log(err.stack || err);
});

