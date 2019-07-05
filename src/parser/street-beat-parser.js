let AbstractParser = require("./abstract-parser");
let cheerio = require("cheerio");
let sanitize = require("../util/sanitize")
let loadAndParse = require("../util/load-and-parse");
let to = require("await-to-js").default;

const ARTICLE_SELECTOR = ".product-article"
const PRICE_SELECTOR = ".product-col__aside--right .price--current"
const TITLE_SELECTOR = ".product-heading span"

module.exports = class StreetBeatParser extends AbstractParser {

    // TODO rework with use of load-and-parse module
    async parse(url) {
        // let browser = this.browser;        
        // let page = await browser.newPage(); 
        // await page.goto(url)
        // let html = await page.content();
        // await page.close();
        
        // let $ = cheerio.load(html);

        // let article = $(ARTICLE_SELECTOR);
        // let price = $(PRICE_SELECTOR);
        // let title = $(TITLE_SELECTOR);

        // if (article.length == 0 || price.length == 0) {
        //     return Promise.reject(`Cant extract data from url: ${url}`)
        // }

        // article = sanitize.article(article.text())
        // price = sanitize.price(price.text())
        // title = title.text()

        // if (isNaN(price)) {
        //     return Promise.reject(`Cant parse price from url: ${url}`);
        // }

        // return { article, price, title };

        let [err, data] = await to(loadAndParse(this.browser, url, {
            title: TITLE_SELECTOR,
            price: PRICE_SELECTOR,
            article: ARTICLE_SELECTOR
        }));

        if (err) {
            return Promise.reject(err);
        }

        let { title, article, price } = data;

        article = sanitize.article(article)
        price = sanitize.price(price)

        if (!article || !price) {
            return Promise.reject("Cant extract data from " + url)
        }

        if (isNaN(price)) {
            return Promise.reject("Cant extract price from " + url);
        }

        return { title, article, price }
    }
}