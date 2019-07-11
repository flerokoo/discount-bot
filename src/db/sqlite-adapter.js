let config = require("../config");
let to = require("await-to-js").to;
let knex = require("knex");


let initialize = async () => {
    let hasTable, err;

    let db = knex({
        client: "sqlite3",
        useNullAsDefault: true,
        connection: { filename: config.dbPath }
    });

    [err, hasTable] = await to(db.schema.hasTable("items"));

    if (err) {
        return Promise.reject("Can't query database");
    }

    if (!hasTable) {
        await db.schema.createTable("items", table => {
            table.increments();
            table.string("shop"); // TODO remove
            table.string("title");
            table.string("url");
            table.string("article");
            table.integer("current_price");
            table.timestamps(true, true);             
        });        
    }

    
    [err, hasTable] = await to(db.schema.hasTable("wishes"));

    if (err) {
        return Promise.reject("Can't query database");
    }
    
    if (!hasTable) {
        await db.schema.createTable("wishes", table => {
            table.increments();
            table.string("user_id");
            table.string("url");
            table.float("initial_price");
            table.float("last_known_price");
        });
    }
    
    return db;
};


let adapter = null;
let gedAdapter = async () => {
    
    if (adapter !== null) {
        return Promise.resolve(adapter);
    }

    let [err, db] = await to(initialize());            

    if (err) {
        throw new Error("Cannot create sqlite database");
    }

    // eslint-disable-next-line require-atomic-updates
    adapter = {};
    
    require("./sqlite-items")(db, adapter);
    require("./sqlite-wishes")(db, adapter);

    return adapter;
};

module.exports = gedAdapter;

