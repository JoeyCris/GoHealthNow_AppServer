//var winston = require("winston");

//winstonvar logger = new (winston.Logger)({
//    transports: [
//        new (winston.transports.Console)({
//            level: 'info',
//            colorize: true
//        }),
//        new (winston.transports.File)({
//            level: 'debug',
//            filename: './log/logfile.log'
//        })
//    ]
//});

var logger = console;

module.exports = logger;
