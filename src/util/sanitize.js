module.exports = {    
    article: art => typeof art === 'string'
        ? art.replace(/[\s\n]+/ig, "")
        : null,
    price: price => typeof price === 'string'
        ? parseInt(price.replace(/[\D]+/gi, ""))
        : null
}