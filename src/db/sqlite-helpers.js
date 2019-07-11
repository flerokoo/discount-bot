
let forceQuery = a => a;

let genericExists = (db, table) => (where = null) => {
    if (typeof where !== 'object' || where === null) {
        return Promise.reject(`Wrong where object given: ${where}`);
    }

    return db
        .select()
        .from(table)
        .where(where)
        .limit(1)
        .then(result => result.length > 0);
};

let genericGet = (db, table) => (where = null, bindings) => {
    
    if (typeof where === "object" && where === null) {
        where = {};
    }

    let query = db.select().from(table);

    if (typeof where === 'object') {
        query.where(where);
    } else if (typeof where === 'string') {
        query.whereRaw(where, bindings);
    } else if (typeof where === "function") {
        where(query);
    }
    
    return query;  
};

let genericUpdate = (db, table) => (where = null, values = null) => {

    if (typeof where !== "object" || where === null) {
        Promise.reject("Update queries without 'where' object are not allowed");
    }

    if (typeof values !== "object" || values === null) {
        Promise.reject("Update queries without new values are not allowed");
    }

    return db(table)
        .update(values)
        .where(where)
        .then(forceQuery); 
};

let genericDelete = (db, table) => (where = null) => {
    if (typeof where !== "object" || where === null) {
        Promise.reject("Update queries without 'where' object are not allowed");
    }

    return db(table).where(where).delete().then(forceQuery);
};

module.exports = { genericExists, genericGet, genericUpdate, genericDelete };