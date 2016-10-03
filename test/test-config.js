module.exports = {
    hostname: '127.0.0.1',
    port: '3000',
    webPath: __dirname,
    mockPath: __dirname,
    logLevel: 'error',
    proxies: {
        '/msg': {
            host: '127.0.0.1:3000',
            prefixPath: '/api/msg'
        },

        '/addcart': {
            host: '127.0.0.1:3000',
            prefixPath: '/api/cart',
            headers: {
                host: 'api.examples.com'
            }
        }
    },
    mocks: {
        '/api/list': './test-data.json',
        '/api/msg': function(req, res) {
            res.json( {msg: 'hello' });
        },
        '/api/cart': {
            'get': './test-data.json',
            'post': function(req, res) {
                res.json({msg: 'successful'});
            }
        }
    }
};