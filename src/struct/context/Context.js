const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a Context.
 * @param {string} id - Context ID.
 * @param {ContextOptions} [options={}] - Options for the Context.
 * @extends {AkairoModule}
 */
class Context extends AkairoModule {
    constructor(id, {
        category,
        name
    } = {}) {
        super(id, { category });

        /**
         * The ID of this Context.
         * @name ContextHandler#id
         * @type {string}
         */

        /**
         * The Context handler.
         * @name ContextHandler#handler
         * @type {ContextHandler}
         */

        this.name = name;
    }

    /**
     * Executes the Context.
     * @abstract
     * @param {...args} [args] - Arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Reloads the Context.
     * @method
     * @name Context#reload
     * @returns {Context}
     */

    /**
     * Removes the Context.
     * @method
     * @name Context#remove
     * @returns {Context}
     */
}

module.exports = Context;

/**
 * Options to use for Context execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} ContextOptions
 * @prop {string} ContextId - The custom id of the Context to listen to.
 */
