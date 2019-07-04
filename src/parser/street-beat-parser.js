let AbstractParser = require("./abstract-parser");
let cheerio = require("cheerio");
let sanitize = require("../util/sanitize")

const ARTICLE_SELECTOR = ".product-article"
const PRICE_SELECTOR = ".product-col__aside--right .price--current"
const TITLE_SELECTOR = ".product-heading span"

module.exports = class StreetBeatParser extends AbstractParser {
    async parse(url) {
        let browser = this.browser;        
        let page = await browser.newPage(); 
        await page.goto(url)
        let html = await page.content();
        await page.close();
        
        let $ = cheerio.load(html);

        let article = $(ARTICLE_SELECTOR);
        let price = $(PRICE_SELECTOR);
        let title = $(TITLE_SELECTOR);

        if (article.length == 0 || price.length == 0) {
            return Promise.reject(`Cant extract data from url: ${url}`)
        }

        article = sanitize.article(article.text())
        price = sanitize.price(price.text())
        title = title.text()

        if (isNaN(price)) {
            return Promise.reject(`Cant parse price from url: ${url}`);
        }

        return { article, price, title };
    }
}