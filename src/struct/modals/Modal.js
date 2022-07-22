const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a Modal.
 * @param {string} id - Modal ID.
 * @param {ModalOptions} [options={}] - Options for the Modal.
 * @extends {AkairoModule}
 */
class Modal extends AkairoModule {
    constructor(id, {
        category,
        args,
        modalId
    } = {}) {
        super(id, { category });

        /**
         * The ID of this modal.
         * @name ModalHandler#id
         * @type {string}
         */

        /**
         * The modal handler.
         * @name ModalHandler#handler
         * @type {ModalHandler}
         */

        this.modalId = modalId;
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
     * Executes the modal.
     * @abstract
     * @param {...args} [args] - Arguments.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Reloads the modal.
     * @method
     * @name Modal#reload
     * @returns {Modal}
     */

    /**
     * Removes the Modal.
     * @method
     * @name Modal#remove
     * @returns {Modal}
     */
}

module.exports = Modal;

/**
 * Options to use for modal execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} ModalOptions
 * @prop {string} modalId - The custom id of the modal to listen to.
 */
