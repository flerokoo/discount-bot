
const moment = require("moment");
const timestampFormat = "YYYY-MM-DD HH:mm:ss";

module.exports = {
    getTimestamp: () => moment().format(timestampFormat),
    fromTimestamp: ts => moment(ts, timestampFormat)
};
