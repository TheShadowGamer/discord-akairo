const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a Select.
 * @param {string} id - Select ID.
 * @param {SelectOptions} [options={}] - Options for the Select.
 * @extends {AkairoModule}
 */
class Select extends AkairoModule {
    constructor(id, {
        category,
        args,
        selectId
    } = {}) {
        super(id, { category });

        /**
         * The ID of this select.
         * @name SelectHandler#id
         * @type {string}
         */

        /**
         * The sutton handler.
         * @name SelectHandler#handler
         * @type {SelectHandler}
         */

        this.selectId = selectId;
        this.args = values => {
            const res = this.client.util.collection();
            let i = 0;
            for (const arg of args) {
                res.set(arg, values[i++]);
            }
            return res;
        };
    }

    /**
     * Executes the select.
     * @abstract
     * @param {...args} [args] - Arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Reloads the Select.
     * @method
     * @name Select#reload
     * @returns {Select}
     */

    /**
     * Removes the Select.
     * @method
     * @name Select#remove
     * @returns {Select}
     */
}

module.exports = Select;

/**
 * Options to use for select execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} SelectOptions
 * @prop {string} selectId - The custom id of the select to listen to.
 */
