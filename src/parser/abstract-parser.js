module.exports = class AbstractParser {
    constructor() {
        this.browser = null;
    }    

    setBrowser(browser) {
        if (this.browser) {
            throw new Error("This parser already has browser");
        }

        this.browser = browser;
    }
   
    // eslint-disable-next-line no-unused-vars
    parse(url) {
        throw new Error("Not implemented");
    }
};