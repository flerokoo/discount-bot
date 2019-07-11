let AbstractParser = require("./abstract-parser");
let sanitize = require("../util/sanitize");
let loadAndParse = require("../util/load-and-parse");
let to = require("await-to-js").default;

const PRICE_SELECTOR = ".ii-product__wrapper .ii-product__price-current";
const TITLE_SELECTOR = ".heading_m.ii-product__title";

module.exports = class LamodaParser extends AbstractParser {

    async parse(url) {

        let [err, data] = await to(loadAndParse(this.browser, url, {
            price: PRICE_SELECTOR,
            title: TITLE_SELECTOR,
            article: $ => $('.ii-product__attribute-label:contains("Артикул")')
                .parent()
                .text()
        }));

        if (err) {
            return Promise.reject(err);
        }

        let { title, article, price } = data;

        article = sanitize.article(article);
        price = sanitize.price(price);
        title = sanitize.title(title);


        if (!price || isNaN(price)) {
            return Promise.reject("Cant extract price from " + url);
        }

        return { title, article, price };
    }
};