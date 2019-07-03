module.exports = url => {
    url = url.toLowerCase();

    if (url.startsWith("http://")) {
        url = url.substr(7)
    } else if (url.startsWith("https://")) {
        url = url.substr(8)
    }

    let result = url.match(/[.]?([\w\d\-]+\.[a-z]+)\//i);

    if (!result) return null;

    return result[1];
}