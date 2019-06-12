'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})


Route.resource('projects', 'ProjectController').apiOnly()

// Route.resource('modules', 'ModuleController')
//   .middleware(['validateProjectToken'])
//   .middleware(new Map([
//     [['show'], ['validateModuleOwner']]
//   ]))
//   .apiOnly()

// Route.get('components/:projectToken/bundle/:moduleName+', 'ModuleController.serveBundle')
//   .middleware(['validateProjectToken', 'validateModuleOwner'])
  
// Route.get('components/:projectToken/:moduleName+', 'ModuleController.serve')
//   .middleware(['validateProjectToken', 'validateModuleOwner', 'http2PushCache'])