var httpProxy = require('express-http-proxy');
var express = require("express");
var _       = require('underscore');
var app = express();
var net = require('net');
var fs  = require('fs');
var defaultConfig = {
    hostname : '0.0.0.0',
    port: '3000',
    webPath: [process.cwd()],
    mockPath: process.cwd(),
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
            res.json({ code: 0, data: { id: 1, name: "javascript in action" } });
        },
        '/api/cart': {
            'get': 'testdata/test.json',
            'post': function(req, res) {
                res.send("add cart successful");
            }
        }*/
    }
}

module.exports =  function(config, middleware){
    if(!_.isObject(config)){
        console.error('config is not a object');
    }
    config = _.defaults(config, defaultConfig);

    //mocks
    _.each(config.mocks, function (mockConfig, key) {
        if (_.isString(mockConfig)) {
            console.log("use static file to handle url: " + key + " [get]");
            app.get(key, function (req, res) {
                res.sendFile(mockConfig, getSendFileOptions(config.mockPath));
            });
        } else if (_.isFunction(mockConfig)) {
            console.log("use function to handle url: " + key + " [get]");
            app.get(key, mockConfig);
        } else if (_.isObject(mockConfig)) {
            var route = app.route(key);
            _.each(mockConfig, function (methodConfig, method) {
                if (_.isString(methodConfig)) {
                    console.log("use static file to handle url: " + key + " [" + method + "]");
                    route[method](function (req, res) {
                        res.sendFile(methodConfig, getSendFileOptions(config.mockPath));
                    })
                } else if (_.isFunction(methodConfig)) {
                    console.log("use function to handle url: " + key + " [" + method + "]");
                    route[method](methodConfig);
                }
            });
        }
    });

    //proxies
    _.each(config.proxies, function(proxyConfig, key){
        var router = express.Router();
        if(proxyConfig.host.indexOf('http://') != 0 && proxyConfig.host.indexOf('https://') != 0){
            proxyConfig.host = 'http://' + proxyConfig.host;
        }
        router.all('*', httpProxy(proxyConfig.host, {
            decorateRequest: function(req) {
                if (proxyConfig.prefixPath) {
                    req.path = proxyConfig.prefixPath + req.path;
                }

                if(!_.isEmpty(proxyConfig.headers)){
                    _.each(proxyConfig.headers, function(header, key){
                        req.headers[key] = header;
                    })
                }
                
                return req;
            }
        }))

        app.use( key ,router)
    })

    //static resources
    if (_.isArray(config.webPath)) {
        config.webPath.forEach(function(wp){
            app.use(express.static(wp))
        });
    } else if (_.isString(config.webPath)) {
         app.use(express.static(config.webPath));
    }
    

    if(typeof middleware === 'function'){
        middleware(app, express);
    }

    var dirview = `<head><title>Files-View</title></head><div style="width:600px;  margin:0 auto;margin-top:100px;"><h1>Files:</h1><ul>
            <% _.each(files, function(file){ %>
            <li style="list-style-type:none;"><a href = '<%=url+file%>'><h2> <%=file %></h2> </a></li>
            <% }) %>
        </ul></div>`;

    app.get(/^[A-Za-z0-9\-\/_]+$/, function(req, res){
        var files = fs.readdirSync(config.webPath[0] + req.path);
        var tpl = _.template(dirview);
        res.send(tpl({files: files, url: req.path }))
    });


    probe(config.port, function(port){
        app.listen(port, config.hostname, function(){
            if(port != config.port){
                console.log("Because the " + config.port + "-port is in use, it enabled " + port + "-port")
            }
            console.log("Starting up: http://" + config.hostname +":" + port)

        })
    })
}

function probe(port, callback) {
    var server = net.createServer().listen(port)
    server.on('listening', function() {
        try{
            server.close();
        }catch(err){}
        callback(port)
    })
    server.on('error', function(err) {
        try{
            server.close();
        }catch(err){}
        if(err.code === 'EACCES'){
            console.error('This port run of root permission.')
        }
        if (err.code === 'EADDRINUSE'){
            probe(parseInt(port) + 1, callback)
        }
    })
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
