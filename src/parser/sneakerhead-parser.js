let AbstractParser = require("./abstract-parser");
let sanitize = require("../util/sanitize");
let loadAndParse = require("../util/load-and-parse");
let to = require("await-to-js").default;

const TITLE_SELECTOR = ".container.product-page h1";

module.exports = class SneakerheadParser extends AbstractParser {

    async parse(url) {

        let [err, data] = await to(loadAndParse(this.browser, url, {
            title: TITLE_SELECTOR,
            price: $ => {
                let discountPriceContainer = $(".price-table .price-new");
                let priceContainer = $(".price-table .price");

                if (discountPriceContainer.length > 0) {
                    return discountPriceContainer.text();
                } else {
                    return priceContainer.text();
                }
            }
        }));

        if (err) {
            return Promise.reject(err);
        }

        let { title, price } = data;
        let article = "";
        
        price = sanitize.price(price);
        title = sanitize.title(title);

        if (!price || isNaN(price)) {
            return Promise.reject("Cant extract price from " + url);
        }

        return { title, article, price };
    }
};