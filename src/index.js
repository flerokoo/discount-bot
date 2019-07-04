let axios = require("axios").default;
let cheerio = require("cheerio");
let puppeteer = require("puppeteer");
let sqlite3 = require("sqlite3").verbose();
let config = require("./config")
let getDbAdapter = require("./db/sqlite-adapter");
let { EventEmitter } = require("events");
let Crawler = require("./crawler")
let { createDefaultParser } = require("./parser/parse-manager")
let startBot = require("./bot")

let mediator = new EventEmitter();

puppeteer.launch().then(browser => {
    createDefaultParser(browser);
    return getDbAdapter(mediator);
}).then(async db => {
    let crawler = new Crawler(mediator, db);
    crawler.start();

    startBot(mediator, db)
    // db.addItem("https://street-beat.ru/d/krossovki-nike-ao4971-002/")
    //     .then(() => db.getItems())
    //     .then(console.log)
    
    // db.getItems().then(console.log)

    // db.addWishByUrl("some_new_use2r2",
    //     "https://street-beat.ru/d/krossovki-nike-ao4971-002/")
    //     .then(() => db.getWishes())
    //     .then(console.log)
    //     .catch(console.error)
    
}).catch(err => {
    throw new Error(err)
});




(async () => {
    // let response = await axios.get("https://street-beat.ru/d/krossovki-new-balance-ml574obc-d/", {
    //     headers: {
    //         "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    //     }
    // });
    // let $ = cheerio.load(response.data);
    // console.log(response.data)
    // let article = $(".product-article")
    // console.log(article)

    console.time("launching browser")
    let browser = await pup.launch();
    console.timeEnd("launching browser")
    
    console.time("new page")
    let page = await browser.newPage();    
    console.timeEnd("new page")
    
    console.time("goto")
    await page.goto("https://street-beat.ru/d/krossovki-new-balance-ml574obc-d/")
    console.timeEnd("goto")

    console.time("cont")
    let html = await page.content()
    console.timeEnd("cont")

    let $ = cheerio.load(html)

    console.log($(".product-article").text())

    // console.log(html)
    await browser.close();
});