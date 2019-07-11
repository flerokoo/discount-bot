const winston = require("winston");
const { Console, File } = winston.transports;
const config = require("../config");
const path = require("path");
const { getTimestamp } = require("../db/timestamp");

const logger = winston.createLogger();

const fileFormat = winston.format.combine(
    winston.format.printf(info => `${info.level}\t ${getTimestamp()}\t${info.message}`)
);

logger.add(new File({
    filename: path.join(config.logPath, "combined.txt"),
    format: fileFormat
}));

logger.add(new File({
    filename: path.join(config.logPath, "errors.txt"),
    level: "error",
    format: fileFormat
}));


if (process.env.NODE_ENV === "development") {
    logger.add(new Console({
        format: winston.format.combine(
            winston.format.cli(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;