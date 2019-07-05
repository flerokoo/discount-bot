
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

// to force knex perform a database request
let forceQuery = a => a;

let initialize = async () => {
    let err, query, hasTable;

    let db = knex({
        client: "sqlite3",
        useNullAsDefault: true,
        connection: { filename: config.dbPath }
    });

    [err, hasTable] = await to(db.schema.hasTable("items"));

    if (!hasTable) {
        [err, query] = await db.schema.createTable("items", table => {
            table.increments();
            table.string("shop");
            table.string("title");
            table.string("url");
            table.string("article");
            table.integer("current_price");
            table.timestamps(true, true);             
        })        
    }

    
    [err, hasTable] = await to(db.schema.hasTable("wishes"));
    
    if (!hasTable) {
        await db.schema.createTable("wishes", table => {
            table.increments();
            table.string("user_id");
            table.string("article");
            table.string("shop");
            table.string("url");
            table.float("initial_price");
            table.float("last_known_price");
        })
    }

    // let { Writable } = require("stream");
    // let w = new Writable()
    // w._write = (chunk, enc, next) => {
    //     console.log("___")
    //     console.log(chunk)
    //     console.log(enc)
    //     next();
    // }
    // let through = require("through2");
    // let a = db.select().from("items").pipe(through.obj((chunk, enc, next) => {        
    //     console.log(chunk)
    //     next();
    // }))

    // a.on("finish", () => console.log("FINISH"))
    // console.log(db.select().count().from("wishes").where("deleted", 0).toQuery())
    // db("wishes").insert({
    //     user_id,
    //     url,
    //     initial_price,
    //     shop: "brandshop",
    //     article: "123"
    // })

        

    return db;
}

// -------------- WISHES ----------------

let addWishByUrlFactory = db => async (user_id, url) => {
    // TODO add wished item to items table too (if needed)
    let parser = getDefaultParser();
    let [err, data] = await to(parser.getData(url));

    if (err) {
        return Promise.reject(err);
    }

    let { title, article, price } = data;

    // where does adapter come from??
    return adapter.addWish(user_id, url, price, article, title).then(forceQuery);
}

let addWishFactory = db => async (user_id, url, initial_price, article, title) => {
    let shop = extractDomain(url);

    if (config.supportedShops.indexOf(shop) === -1) {
        return Promise.reject("Unsupported shop");
    }

    let adapter = await getAdapter();
    
    let hasWish = await adapter.doesUserHaveWish(user_id, url);

    if (hasWish) {
        return Promise.reject("Wish already on a list");
    }

    // INSERT NEW WISH
    let insertPromise = db("wishes").insert({
        user_id,
        url, 
        article,
        initial_price,
        last_known_price: initial_price,
        shop
    }).then(forceQuery)

    // ADD WISHES ITEM TO THE LIST
    let addItemPromise = getAdapter()
        .then(adapter => adapter.addItem(title, url, article, initial_price))
        .catch(err => console.log(err))
    
    return Promise.all([insertPromise, addItemPromise]);
}

let iterateWishesFactory = db => fn => {
    return new Promise((resolve, reject) => {
        let stream = db.select()
            .from("items")
            .pipe(through.obj((chunk, enc, next) => {
                fn(chunk);
                next();
            }))
        
        stream.once("finish", resolve)
    });
}

let getWishesFactory = db => () => {
    return db.select().from("wishes").where("deleted", 0);   
}

let doesUserHaveWishFactory = db => (user_id, url) => {
    return db.select()
        .from("wishes")
        .where("user_id", user_id)
        .where("url", url)
        .limit(1)
        .then(result => result.length > 0)        
}

// ---------------- ITEMS --------------
 
let getItemsFactory = db => () => {
    // WHERE USERS > 0
    return db
        .select()
        .from("items")
}

let doesItemExistFactory = db => url => {
    return db
        .select()
        .from("items")
        .where("url", url)
        .limit(1)
        .then(result => (console.log(result), result.length > 0))
}

let addItemFactory = db => (title, url, article, current_price) => {
    let shop = extractDomain(url)    
    
    return getAdapter()
        .then(adapter => adapter.doesItemExist(url))
        .then(exists => exists ? Promise.reject("item already on the list") : null)
        .then(() => console.log("adding", title, url, article, current_price))
        .then(() => db("items").insert({
            title,
            url,
            shop,
            article,
            current_price
        }))
        .then(forceQuery)
}

// let addItemByUrlFactory = db => url => {
//     return db("items").insert({
//         url,
//         shop: extractDomain(url),
//         article: "12art",
//         current_price: 22000,
//         created_at: getTimestamp(),
//         updated_at: getTimestamp()
//     }).then(forceQuery)
// }

let updatePriceByIdFactory = db => (id, current_price) => {
    return db("items")
        .update({ current_price, updated_at: getTimestamp() })
        .where("id", id)
        .then(forceQuery)        
}

let batchUpdatePricesFactory = db => prices => {
    let updated_at = getTimestamp()
    let queries = Object.keys(prices)
        .map(key => {
            let current_price = parseInt(prices[key]);
            return db("items")
                .update({ current_price, updated_at })
                .where("id", parseInt(key))
        })
        .join("\n");
    
    return db.raw(queries).then(forceQuery);
}


let adapter = null;
let getAdapter = module.exports = async () => {
    
    if (adapter !== null) {
        return Promise.resolve(adapter);
    }

    let [err, db] = await to(initialize())            

    if (err) {
        throw new Error("Cannot create sqlite database");
    }

    adapter = {
        // wishes
        getWishes: getWishesFactory(db),
        iterateWishes: iterateWishesFactory(db),
        addWish: addWishFactory(db),
        addWishByUrl: addWishByUrlFactory(db),
        doesUserHaveWish: doesUserHaveWishFactory(db),
        // items
        getItems: getItemsFactory(db),
        addItem: addItemFactory(db),
        updatePriceById: updatePriceByIdFactory(db),
        doesItemExist: doesItemExistFactory(db),
        batchUpdatePrices: batchUpdatePricesFactory(db)
        
    }

    initializationPromise = null;

    return adapter;
}

