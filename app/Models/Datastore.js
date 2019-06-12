'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Datastore extends Model {

  /**
   * Insert values to the database. This method will
   * call before and after hooks for `create` and
   * `save` event.
   *
   * @method _insert
   * @async
   *
   * @param {Object} trx
   *
   * @return {Boolean}
   *
   * @private
   */
  async _insert(trx) {
    /**
     * Executing before hooks
     */
    await this.constructor.$hooks.before.exec('create', this)

    /**
     * Set timestamps
     */
    this._setCreatedAt(this.$attributes)
    this._setUpdatedAt(this.$attributes)
    this._formatDateFields(this.$attributes)

    // const query = this.constructor.query()

    /**
     * If trx is defined then use it for the save
     * operation.
     */
    if (trx) {
      // query.transacting(trx)
    }

    /**
     * Execute query
     */
    // const result = await query
    //   .returning(this.constructor.primaryKey)
    //   .insert(this.$attributes)

    console.log('saving', this.$attributes)
    const result = Object.assign({}, this.$attributes)

    /**
     * Only set the primary key value when incrementing is
     * set to true on model
     */
    if (this.constructor.incrementing) {
      this.primaryKeyValue = result[0]
    }

    this.$persisted = true

    /**
     * Keep a clone copy of saved attributes, so that we can find
     * a diff later when calling the update query.
     */
    this._syncOriginals()

    /**
     * Executing after hooks
     */
    await this.constructor.$hooks.after.exec('create', this)
    return true
  }

  /**
   * Update model by updating dirty attributes to the database.
   *
   * @method _update
   * @async
   *
   * @param {Object} trx
   *
   * @return {Boolean}
   */
  async _update(trx) {
    /**
     * Executing before hooks
     */
    await this.constructor.$hooks.before.exec('update', this)
    let affected = 0

    const query = this.constructor.query()

    /**
     * If trx is defined then use it for the update
     * operation.
     */
    if (trx) {
      query.transacting(trx)
    }

    if (this.isDirty) {
      /**
       * Set proper timestamps
      */
      this._setUpdatedAt(this.$attributes)
      this._formatDateFields(this.$attributes)

      affected = await query
        .where(this.constructor.primaryKey, this.primaryKeyValue)
        .ignoreScopes()
        .update(this)
    }

    /**
     * Executing after hooks
     */
    await this.constructor.$hooks.after.exec('update', this)

    if (this.isDirty) {
      /**
       * Sync originals to find a diff when updating for next time
       */
      this._syncOriginals()
    }

    return !!affected
  }
}

module.exports = Datastore
