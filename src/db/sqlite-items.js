
let sqlite3 = require("sqlite3");
let config = require("../config");
let to = require("await-to-js").to;
let knex = require("knex")
let extractDomain = require("../util/extract-domain");
let moment = require("moment");
let { getTimestamp } = require("./timestamp")
let through = require("through2");
let { getDefaultParser } = require("../parser/parse-manager")
let memoize = require("promise-memoize");
let helpers = require("./sqlite-helpers");

let forceQuery = () => null;

module.exports = (db, adapter) => {

    let add = (title, url, article, current_price) => {
        let shop = extractDomain(url)    
        
        return adapter.items.existsByUrl(url)
            .then(exists => exists ? Promise.reject("item already on the list") : null)
            // .then(() => console.log("adding", title, url, article, current_price))
            .then(() => db("items").insert({
                title,
                url,
                shop,
                article,
                current_price
            }))
            .then(forceQuery)
    }
 
    let get = helpers.genericGet(db, "items");

    let exists = helpers.genericExists(db, "items");
    let existsByUrl = url => exists({ url });

    let _update = helpers.genericUpdate(db, "items");
    let update = (where, values) => _update(where, { ...values, updated_at: getTimestamp() })
    let updatePriceById = (id, current_price) => update({ id }, { current_price });

    let batchUpdatePrices = prices => {
        let updated_at = getTimestamp()
        
        let queries = prices.map(data => db("items")
            .update({ updated_at, current_price: data.current_price })
            .where("id", data.id)
            .toQuery()
        ).join(";\n")
        
        return db.raw(queries).then(forceQuery);
    }

    let all = { add, get, exists, update, updatePriceById, existsByUrl, batchUpdatePrices }
    Object.assign(adapter, { items: all })
}