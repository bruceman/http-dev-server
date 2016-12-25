var httpProxy = require('express-http-proxy');
var serveIndex = require('serve-index');
var express = require('express');
var _       = require('underscore');
var app = express();
var net = require('net');
var fs  = require('fs');
var logger = require('./lib/logger');


var defaultConfig = {
    hostname : '0.0.0.0',
    port: '3000',
    webPath:  process.cwd(),
    mockPath: process.cwd(),
    logLevel: 'info',
    proxies: {
        /*
        '/api': {
            host: '127.0.0.1:6000',
        },
        '/userapi': {
            host: '127.0.0.1:7000',
            headers: {
                host: 'api.examples.com'
            }
        }*/
    },
    mocks: {
        /*
        '/api/item/list': 'testdata/test.json',
        '/api/item/1': function(req, res) {
            res.json({ code: 0, data: { id: 1, name: 'javascript in action' } });
        },
        '/api/cart': {
            'get': 'testdata/test.json',
            'post': function(req, res) {
                res.send('add cart successful');
            }
        }*/
    }
}

module.exports =  function(config){
    if(!_.isObject(config)){
        logger.error('config is invalid, please check your config.');
        return;
    }

    config = _.defaults(config, defaultConfig);
    //set logger level
    logger.logLevel = config.logLevel || 'info';

    //mocks
    _.each(config.mocks, function (mockConfig, key) {
        if (_.isString(mockConfig)) {
            logger.info("[GET] %s -> %s", key, mockConfig);
                
            app.get(key, function (req, res) {
                logger.debug("[GET] %s -> %s", key, mockConfig);
                res.sendFile(mockConfig, getSendFileOptions(config.mockPath));
            });
        } else if (_.isFunction(mockConfig)) {
            logger.info("[GET] %s -> [function]", key);
            app.get(key, mockConfig);
        } else if (_.isObject(mockConfig)) {
            var route = app.route(key);
            _.each(mockConfig, function (methodConfig, method) {
                if (_.isString(methodConfig)) {
                    logger.info("[%s] %s -> %s", method.toUpperCase(), key, methodConfig);
                    route[method](function (req, res) {
                        logger.debug("[%s] %s -> %s", method.toUpperCase(), key, methodConfig);
                        res.sendFile(methodConfig, getSendFileOptions(config.mockPath));
                    })
                } else if (_.isFunction(methodConfig)) {
                    logger.info("[%s] %s -> [function]", method.toUpperCase(), key);
                    route[method](methodConfig);
                }
            });
        }
    });

    //proxies
    _.each(config.proxies, function(proxyConfig, key){
        var router = express.Router();
        var host = proxyConfig.host;

        if(host.indexOf('http://') != 0 && host.indexOf('https://') != 0){
            host = 'http://' + proxyConfig.host;
        }

        logger.info("[proxy] %s - > %s", key, host);
        
        router.all('*', httpProxy(host, {
            reqBodyEncoding: null,
            decorateRequest: function(req) {
                var path = req.path;

                if (proxyConfig.prefixPath) {
                    req.path = proxyConfig.prefixPath + path;
                }

                logger.debug("[proxy] %s -> %s", key + path, host + req.path);

                if(!_.isEmpty(proxyConfig.headers)){
                    _.each(proxyConfig.headers, function(header, key){
                        req.headers[key] = header;
                    });
                }
                
                return req;
            }
        }))

        app.use(key ,router);
    });

    //static resources
    if (config.webPath) {
        app.use(express.static(config.webPath));
        app.use(serveIndex(config.webPath, {icons: true}));
    }
   
    app.listen(config.port, config.hostname, function(){
        logger.info('Starting http dev server: http://' + config.hostname +':' + config.port);
    });

    return app;
}

function getSendFileOptions(mockPath) {
    return {
        root: mockPath,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };
}
