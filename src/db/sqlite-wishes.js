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
    
    let addIfNotExists = async (user_id, url, initial_price, article, title) => {
        let shop = extractDomain(url);
    
        if (config.supportedShops.indexOf(shop) === -1) {
            return Promise.reject("Unsupported shop");
        }
    
        // ???????????????????????????????????????????????????????????????????????
        // and what if we need to call some item-related adapter function from wishes module???????????
                
        let hasWish = await adapter.wishes.doesUserHave(user_id, url);
    
        if (hasWish) {
            return Promise.reject("Wish already on your wishlist");
        }
    
        // INSERT NEW WISH
        let insertPromise = db("wishes").insert({
            user_id,
            url, 
            article,
            initial_price,
            last_known_price: initial_price,
            shop
        }, ["url", "article", "price"]).then(console.log).then(forceQuery)
    
        // ADD WISHES ITEM TO THE LIST
        let addItemPromise = adapter.items
            .add(title, url, article, initial_price)
            .catch(err => console.log("JUST HERE", err))
        
        return Promise.all([insertPromise, addItemPromise]);
    }

    let addByUrlIfNotExists = async (user_id, url) => {
        // TODO add wished item to items table too (if needed)
        let parser = getDefaultParser();
        let [err, data] = await to(parser.getData(url));
    
        if (err) {
            return Promise.reject(err);
        }
    
        let { title, article, price } = data;
    
        return adapter.wishes
            .addIfNotExists(user_id, url, price, article, title)
            .then(forceQuery);
    }

    let update = helpers.genericUpdate("wishes");

    let batchUpdateLastKnownPrices = data => {
        let queries = data.map(({ id, price }) => {
            return db("wishes").update("last_known_price", price)
                .where("id", id).toQuery();
        }).join(";\n");

        return db.raw(queries).then(forceQuery);
    }

    let get = helpers.genericGet(db, "wishes");

    let exists = helpers.genericExists(db, "wishes");

    let doesUserHave = (user_id, url) => exists({ user_id, url })

    let iterate = (fn, where = null) => {
        return new Promise((resolve, reject) => {
            let query = db
                .select()
                .from("items")

            if (typeof where === 'object') {
                query.where(where)
            }

            query.pipe(through.obj((chunk, enc, next) => {
                    fn(chunk);
                    next();
                }))
            
            stream.once("finish", resolve)
        });
    }

    all = { addIfNotExists, addByUrlIfNotExists, get, update, doesUserHave, iterate, exists }
    Object.assign(adapter, { wishes: all })
}