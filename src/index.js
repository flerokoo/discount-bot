const puppeteer = require("puppeteer-extra");
const getDbAdapter = require("./db/sqlite-adapter");
const { EventEmitter } = require("events");
const Crawler = require("./crawler");
const { createDefaultParser } = require("./parser/parse-manager");
const startBot = require("./bot");
const { createContainer, asClass, asValue, asFunction } = require("awilix");
const registerScenes = require("./bot/scenes");
const config = require("./config");
const logger = require("./util/logger");
const stealth = require("puppeteer-extra-plugin-stealth");

puppeteer.use(stealth());

const mediator = new EventEmitter();

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

const options = {
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
    ],
    headless: true,
    executablePath
};


const container = createContainer();
container.register("config", asValue(config));
container.register("mediator", asValue(mediator));
container.register("Stage", asValue(require("telegraf/stage")));
container.register("Telegraf", asValue(require("telegraf")));
container.register("Scene", asValue(require("telegraf/scenes/base")));
container.register("registerScenes", asValue(registerScenes));

logger.info("Starting...")
puppeteer.launch(options).then(browser => {
    container.register("browser", asValue(browser));
    container.register("parser", asValue(createDefaultParser(browser)));
    return getDbAdapter(mediator);
}).then(async db => {
    container.register("db", asValue(db));
    container.register("bot", asFunction(startBot).singleton());
    container.register("crawler", asClass(Crawler).singleton());
    container.resolve("crawler").start();
    container.resolve("bot");
}).catch(err => {
    logger.error("Failed to start.");
    console.log(err.stack || err);
});


