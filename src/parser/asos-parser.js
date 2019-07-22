let AbstractParser = require("./abstract-parser");
let sanitize = require("../util/sanitize");
let loadAndParse = require("../util/load-and-parse");
let to = require("await-to-js").default;
const logger = require("../util/logger");

const TITLE_SELECTOR = ".layout-aside .product-hero h1";
const PRICE_SELECTOR = ".layout-aside .current-price";
const ARTICLE_SELECTOR = ".product-details .product-code span";

module.exports = class AsosParser extends AbstractParser {

    async parse(url) {

        let [err, data] = await to(loadAndParse(this.browser, url, {
            title: TITLE_SELECTOR,
            price: PRICE_SELECTOR,
            article: ARTICLE_SELECTOR
        }));

        if (err) {
            return Promise.reject(err);
        }

        let { title, price, article, html } = data;

        article = sanitize.article(article);
        price = sanitize.price(typeof price === 'string' ? price.split(",")[0] : null);
        title = sanitize.title(title);


        if (!price || isNaN(price)) {
            logger.debug(html)
            return Promise.reject("Cant extract price from " + url);
        }

        return { title, article, price };
    }
};