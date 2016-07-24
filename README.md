# http-dev-server
A simple http server for develop purpose, support reserve proxy and mock API request


#Install
npm install http-dev-server

#Command
````js
npm install -g http-dev-server   
http-dev-server
````

#Script Usage:
````js
server = require('http-dev-server')   
server(option, callback)  
````
##Option
````js
var config = {
    hostname : '0.0.0.0',
    port: '80',
    webPath: [__dirname],
    proxies:{
        '/speapi':{
            host: 'api.demo.com',
            headers:{
                host: 'api.demo.com'
            }
        }
    }
}
````

##Refs:
This repository is forked from https://github.com/suxiaoxin/http-server-dev
