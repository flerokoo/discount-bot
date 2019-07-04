let extractDomain = require("../util/extract-domain");
let StreetBeatParser = require("./street-beat-parser");
let config = require("../config");

class ParseManager {
    constructor(browser) {
        this.parsers = {};
        this.browser = browser;
    }

    async getData(url) {
        this.checkParsers();
        let parser = this.selectParser(url)

        if (parser === null) {
            return Promise.reject("No parser found for " + url);
        }

        return parser.parse(url);
    }

    selectParser(url) {
        let shop = extractDomain(url);

        if (!shop) return null;

        if (!this.parsers[shop]) return null;

        return this.parsers[shop];    
    }

    checkParsers() {
        if (config.supportedShops.some(shop => !this.parsers[shop])) {
            throw new Error("Not enough parsers");
        }
    }

    registerParser(shop, parser) {
        this.parsers[shop.toLowerCase()] = parser;
        parser.setBrowser(this.browser);
    }
}

let defaultParser = null;

let createDefaultParser = browser => {
    if (defaultParser === null) {
        defaultParser = new ParseManager(browser);
        defaultParser.registerParser("street-beat.ru", new StreetBeatParser());
    }
    
    return defaultParser;
}

let getDefaultParser = () => {
    if (defaultParser === null) {
        throw new Error("Call createDefaultParser before calling getDefaultParser")
    }

    return defaultParser
} 





module.exports = {
    ParseManager,
    getDefaultParser,
    createDefaultParser
}