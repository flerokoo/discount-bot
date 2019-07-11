let cheerio = require("cheerio");
let bypass = require("./bypass-bot-detection");
let to = require("await-to-js").to;

module.exports = async (browser, url, fields) => {
    // eslint-disable-next-line no-unused-vars
    let _, err, html, page = await browser.newPage(); 

    [err, _] = await to(bypass(page));
    if (err) {
        return Promise.reject("Error when bypassing bot detection: " + err);
    }

    [err, _] = await to(page.goto(url));
    if (err) {
        return Promise.reject(`Error when loading ${url}: ` + err);
    }

    [err, html] = await to(page.content());
    if (err) {
        return Promise.reject("Error when getting html from page: " + err);
    }

    await page.close();
    
    let $ = cheerio.load(html);
    let out = {};

    for (let field in fields) {        
        let selector = fields[field];
        out[field] = null;

        if (typeof selector === "function") {
            out[field] = selector($);
        } else {
            let container = $(selector);
            if (container.length > 0) {
                out[field] = container.text();
            }
        }
    }
    
    return out;
};