const winston = require("winston");
const { Console, File } = winston.transports;
const config = require("../config");
const path = require("path");
const { getTimestamp } = require("../db/timestamp");
const fs = require("fs");


if (!fs.existsSync(config.logPath))
    fs.mkdirSync(config.logPath);

const logger = winston.createLogger();

const logFormat = winston.format.combine(
    winston.format.printf(info => {
        if (info.level === 'debug') return '';
        return `${info.level}\t ${getTimestamp()}\t${info.message}`
    })
);

const debugFormat = winston.format.combine(
    winston.format.printf(info => {
        if (info.level !== 'debug') return '';
        return `${getTimestamp()}\n${info.message}\n\n\n`;
    })
);

logger.add(new File({
    filename: path.join(config.logPath, "combined.txt"),    
    format: logFormat
}));

logger.add(new File({
    filename: path.join(config.logPath, "errors.txt"),
    level: "error",
    format: logFormat
}));

logger.add(new File({
    filename: path.join(config.logPath, "debug.txt"),
    level: "debug",
    format: debugFormat
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