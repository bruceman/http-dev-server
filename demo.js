var server = require('./index');
var config = {
    hostname: '0.0.0.0',
    port: '3000',
    webPath: [__dirname],
    mockPath: __dirname,
    proxies: {
        '/api': {
            prefixPath: '/api',
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

server(config, function(app) {
    //app is express,  app = express()
    console.log('init...')
})
