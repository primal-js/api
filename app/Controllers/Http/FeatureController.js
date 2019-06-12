'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const fse = require('fs-extra')
const fs = require('fs')
const mime = require('mime')

const Feature = use('App/Models/Feature')
const Dependency = use('App/Models/Dependency')
const Helpers = use('Helpers')

/**
 * Resourceful controller for interacting with features
 */
class FeatureController {
  /**
   * Show a list of all features.
   * GET features
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request }) {
    const { project } = request
    
    return Feature
      .query()
      .where('projectId', project.id)
      .fetch()
  }

  /**
   * Create/save a new feature.
   * POST features
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const { projectToken, component } = request.post()
      const { project } = request
      const { name, version, type, dependencies = [], transpiledCode } = component

      const feature = new Feature()
      feature.fill({ name, version, type })

      const featureFilePath = Feature.getFilePath(projectToken, feature)

      try {
        await fse.outputFile(Helpers.publicPath(featureFilePath), transpiledCode)
      } catch (error) {
        console.error('Unable to create component file.', error)
        return response.status(500).send()
      }

      const currentFeature = await Feature.findOrCreate(
        { filePath: featureFilePath },
        {
          ...feature.toJSON(),
          filePath: featureFilePath,
          projectId: project.id,
        }
      )

      for (let dependencyData of dependencies) {
        const { name, version, type } = dependencyData
        const dependency = new Feature()
        dependency.fill({ name, version, type })
        
        if (dependency.type !== 'COMPONENT') {
          continue
        }

        const dependencyFilePath = Feature.getFilePath(projectToken, dependency)
        const dependencyFeature = await Feature.findBy('filePath', dependencyFilePath)
        if (!dependencyFeature) {
          return response.status(400).json({ message: `Unable to find dependency ${JSON.stringify(dependency, null, 2)}` })
        }

        const dependencyBody = {
          featureOwnerId: currentFeature.id,
          featureDependencyId: dependencyFeature.id,
        }

        await Dependency.findOrCreate(dependencyBody, dependencyBody)
      }

      return response.status(201).json({ message: `Feature saved successfully.` })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error })
    }
  }

  /**
   * Display a single feature.
   * GET features/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ request }) {
    const { feature } = request

    return await feature.fetchDependencyTree()
  }

  /**
   * Serve feature files.
   * GET features/:projectToken/:featureName
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async serve({ request, response }) {
    const { feature } = request

    const filePath = Helpers.publicPath(feature.filePath)
    const file = fs.openSync(filePath, 'r')
    const stat = fs.fstatSync(file)
    const contentType = mime.getType(filePath)
    const fileContent = fs.readFileSync(file)
    const cacheMaxAge = 60 * 60 * 24 * 365

    if (contentType) {
      response.header('content-type', contentType)
    }
    response.header('content-length', stat.size)
    response.header('cache-control', `public, max-age=${cacheMaxAge}`);
    
    response.status(200).send(fileContent)
  }

  /**
   * Serve feature bundle.
   * GET bundles/:projectToken/:featureName
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async serveBundle({ request }) {
    const { feature } = request

    const dependencyTree = await feature.fetchDependencyTree()
    const dependencyList = Feature.getDependencyList(dependencyTree)

    const features = dependencyList.map(feature => {
      const filePath = Helpers.publicPath(feature.filePath)
      const file = fs.openSync(filePath, 'r')
      const fileContent = fs.readFileSync(file)

      return {
        name: Feature.nameWithoutExtension(feature.name),
        fileContent: fileContent.toString(),
      }
    })

    return `
      CompaasContainer.define("bundle/${feature.name}", [], function(){
        return ${JSON.stringify(features, null, 2)}
      })
    `
  }

  /**
   * Update feature details.
   * PUT or PATCH features/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a feature with id.
   * DELETE features/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

feature.exports = FeatureController
