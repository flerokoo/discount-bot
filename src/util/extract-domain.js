module.exports = url => {    
    url = url.toLowerCase()
        .replace(/^https?:\/\//i, "");

    let result = url.match(/[.]?([\w\d-]+\.[a-z]+)\//i);

    if (!result) return null;

    return result[1];
};