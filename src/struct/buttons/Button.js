const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a Button.
 * @param {string} id - Button ID.
 * @param {ButtonOptions} [options={}] - Options for the Button.
 * @extends {AkairoModule}
 */
class Button extends AkairoModule {
    constructor(id, {
        category,
        args,
        buttonId
    } = {}) {
        super(id, { category });

        /**
         * The ID of this button.
         * @name ButtonHandler#id
         * @type {string}
         */

        /**
         * The button handler.
         * @name ButtonHandler#handler
         * @type {ButtonHandler}
         */

        this.buttonId = buttonId;
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
     * Executes the button.
     * @abstract
     * @param {...args} [args] - Arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Reloads the button.
     * @method
     * @name Button#reload
     * @returns {Button}
     */

    /**
     * Removes the Button.
     * @method
     * @name Button#remove
     * @returns {Button}
     */
}

module.exports = Button;

/**
 * Options to use for button execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} ButtonOptions
 * @prop {string} buttonId - The custom id of the button to listen to.
 */
