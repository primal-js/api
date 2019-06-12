'use strict'

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')

const path = require('path')
const fs = require('fs')
const http2 = require('http2')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer(handler => {
    const options = {
      key: fs.readFileSync(path.join(__dirname, './ssl/api.primaljs.com.key')),
      cert: fs.readFileSync(path.join(__dirname, './ssl/api.primaljs.com.crt')),
      allowHTTP1: true,
    }
    return http2.createSecureServer(options, handler)
  })
  .catch(console.error)
