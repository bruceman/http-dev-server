# http-dev-server
A simple http server for develop purpose, support rewrite request, mock response data and serve static resources.


##Install
Install on global path
````shell
npm install -g http-dev-server   
````
Or install as a development dependency
````shell
npm install --save-dev http-dev-server   
````

##Usage
Run server by global command
````shell
http-dev-server -f config-sample.js
````
Or config npm script and run server by npm (for example: {"server": "http-dev-server -f ./dev-server-config.js}")
````shell
npm run server
````

##Config Sample 
the content of config-sample.js
````js
module.exports = {
    hostname: '0.0.0.0',
    port: '3000',
    webPath: __dirname,
    mockPath: __dirname,
    logLevel: 'debug',
    proxies: {
        '/api': {
            host: 'api.examples.com',
        },
        '/userapi': {
            host: '127.0.0.1:7000',
            headers: {
                host: 'api.examples.com'
            }
        }
    },
    mocks: {
        '/api/item/list': 'testdata/test.json',
        '/api/item/1': function(req, res) {
            res.json({ code: 0, data: { id: 1, name: "javascript in action" } });
        },
        '/api/cart': {
            'get': 'testdata/test.json',
            'post': function(req, res) {
                res.send("add cart successful");
            }
        }
    }
};
````

##Test
Run project test using mocha
````shell
npm run test   
````

##Refs
- The function params "req, res" are defined in express: http://expressjs.com/en/4x/api.html
- This repository modified from https://github.com/suxiaoxin/http-server-dev
