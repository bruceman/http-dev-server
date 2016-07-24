# http-dev-server
A simple http server for develop purpose, support reserve proxy and mock API request


##Install
````js
npm install -g http-dev-server   
````

##Usage:
````js
http-dev-server -f config-sample.js
````

##Config Sample:
````js
module.exports = {
    hostname: '0.0.0.0',
    port: '3000',
    webPath: [__dirname],
    mockPath: __dirname,
    proxies: {
        '/api': {
            host: '127.0.0.1:6000',
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

##Refs:
- The function params "req, res" are defined in express: http://expressjs.com/en/4x/api.html
- This repository modified from https://github.com/suxiaoxin/http-server-dev
