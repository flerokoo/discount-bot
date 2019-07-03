module.exports = {
    article: art => art.replace(/[\s\n]+/ig, ""),
    price: price => parseInt(price.replace(/[\D]+/gi, ""))
}