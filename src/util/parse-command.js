const re = /^\/([^\s]+)[\s]+(.+)/gmi;

module.exports = text => {
    let result = text.match(re);

    if (!result) return null;

    return {
        command: result[1].toLowerCase(),
        arguments: result[2].split(/[\s]+/g).map(a => a.toLowerCase())
    };
};