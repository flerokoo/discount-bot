let cheerio = require("cheerio");

module.exports = async (browser, url, fields) => {
      
    let page = await browser.newPage(); 

    await page.goto(url)

    let html = await page.content();

    await page.close();
    
    let $ = cheerio.load(html);

    let out = {};

    for (let field in fields) {        
        let selector = fields[field];
        let container = $(selector);

        if (container.length > 0) {
            out[field] = container.text();
        }
    }
    
    return out;
}