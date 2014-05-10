var config = {}

config.mongodb = {};
config.web = {};


config.mongodb.host = '10.211.55.13';
//config.mongodb.host = 'localhost';

config.mongodb.port = 27017;
config.web.port = process.env.PORT || 8081;

module.exports = config;