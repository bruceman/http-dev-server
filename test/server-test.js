var server = require('../index');
var request = require('supertest');
var config = require('./test-config.js');

describe('server tests:', function() {
    var app = null

    before(function() {
        app = server(config);
    });

    describe('mock::process [GET] request', function() {
        it('should get function response', function(done) {
            request(app)
                .get('/api/msg')
                .expect(200, {msg: 'hello'}, done);
        });

        it('mock::should get the list from file', function(done) {
            request(app)
                .get('/api/list')
                .expect(200)
                .expect(function (res) {
                    var list = res.body || [];
                    if (list.length != 3) {
                        throw new Error("/api/list did not return expected result");
                    }
                })
                .end(done);
        });
    });

    describe('mock::process nested [GET] request', function() {
        it('should get the list from file', function(done) {
            request(app)
                .get('/api/cart')
                .expect(200)
                .expect(function (res) {
                    var list = res.body || [];
                    if (list.length != 3) {
                        throw new Error("/api/list did not return expected result");
                    }
                })
                .end(done);
        });
    });

    describe('mock::process [POST] request', function() {
        it('should add cart successful', function(done) {
            request(app)
                .post('/api/cart')
                .expect(200, {msg: 'successful'}, done);
        });
    });

    describe('proxy::process [GET] request', function() {
        it('should get function response', function(done) {
            request(app)
                .get('/msg')
                .expect(200, {msg: 'hello'}, done);
        });

        it('should add cart successful', function(done) {
            request(app)
                .post('/addcart')
                .expect(200, {msg: 'successful'}, done);
        });
    });


});
