let AbstractParser = require("./abstract-parser");
let sanitize = require("../util/sanitize");
let loadAndParse = require("../util/load-and-parse");
let to = require("await-to-js").default;
let logger = require("../util/logger");


const ARTICLE_SELECTOR = ".product-article";
const PRICE_SELECTOR = ".product-col__aside--right .price--current";
const TITLE_SELECTOR = ".product-heading span";

module.exports = class StreetBeatParser extends AbstractParser {

    // TODO rework with use of load-and-parse module
    async parse(url) {
  
        let [err, data] = await to(loadAndParse(this.browser, url, {
            title: TITLE_SELECTOR,
            price: PRICE_SELECTOR,
            article: ARTICLE_SELECTOR
        }));

        if (err) {
            logger.error(err);            
            return Promise.reject(err);
        }

        let { title, article, price, html } = data;

        title = sanitize.title(title);
        article = sanitize.article(article);
        price = sanitize.price(price);

        if (!price || isNaN(price)) {
            logger.debug(html);
            return Promise.reject(`Cant extract price from ${url}`);
        }

        return { title, article, price };
    }
};