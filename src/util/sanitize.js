module.exports = {
    title: name => typeof name === 'string'
        ? name.replace(/[\s]{2,}/gi, " ").trim()
        : null,
    article: art => typeof art === 'string'
        ? art.replace(/[\s\n]+/ig, "")
        : null,
    price: price => typeof price === 'string'
        ? parseInt(price.replace(/[\D]+/gi, ""))
        : null
};