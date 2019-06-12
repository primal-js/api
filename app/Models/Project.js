'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Datastore = use('App/Models/Datastore')

const uuid = require('uuid/v1')

class Project extends Datastore {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', async (project) => {
      if (!project.token) {
        project.token = uuid()
      }
    })
  }
}

module.exports = Project
