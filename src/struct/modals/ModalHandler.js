const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { ModalHandlerEvents: { BUTTON_INVALID } } = require('../../util/Constants');
const Modal = require('./Modal');

/**
 * Loads listeners and registers them with EventEmitters.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class ModalHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = Modal,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter
    } = {}) {
        if (!(classToHandle.prototype instanceof Modal || classToHandle === Modal)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Modal.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Directory to modal listeners.
         * @name ModalHandler#directory
         * @type {string}
         */

        /**
         * Modal listeners loaded, mapped by ID to Modal Listener.
         * @name ModalHandler#modules
         * @type {Collection<string, Listener>}
         */

        this.setup();
    }

    /**
     * @param {CommandHandler} commandHandler - The command handler to use
     * @returns {void}
     */
    useCommandHandler(commandHandler) {
        this.commandHandler = commandHandler;
        return this;
    }

    /**
     * Registers a module.
     * @param {Modal} modal - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(modal, filepath) {
        super.register(modal, filepath);
        modal.exec = modal.exec.bind(modal);
        return modal;
    }

    /**
     * Deregisters a module.
     * @param {Modal} modal - Module to use.
     * @returns {void}
     */
    deregister(modal) {
        super.deregister(modal);
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', i => {
                if (!i.isModalSubmit()) return;
                this.handle(i);
            });
        });
    }

    /**
     * Handles a modal.
     * @param {Interaction} interaction - Modal to handle.
     * @returns {Promise<?boolean>}
     */
    async handle(interaction) {
        try {
            const args = interaction.customId.split('_');
            const mdl = this.modules.find(listener => args[0] === listener.modalId);
            args.shift();
            mdl.exec(interaction, await mdl.args(args));
            return true;
        } catch (err) {
            this.emit(BUTTON_INVALID, interaction);
            return null;
        }
    }

    /**
     * Loads a Modal.
     * @method
     * @name ModalHandler#load
     * @param {string|Listener} thing - Module or path to module.
     * @returns {Modal}
     */

    /**
     * Reads all modals from the directory and loads them.
     * @method
     * @name ModalHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * @returns {ModalHandler}
     */

    /**
     * Removes a modal.
     * @method
     * @name ModalHandler#remove
     * @param {string} id - ID of the modal.
     * @returns {Modal}
     */

    /**
     * Removes all modals.
     * @method
     * @name ModalHandler#removeAll
     * @returns {ModalHandler}
     */

    /**
     * Reloads a modal.
     * @method
     * @name ModalHandler#reload
     * @param {string} id - ID of the modal.
     * @returns {Modal}
     */

    /**
     * Reloads all modals.
     * @method
     * @name ModalHandler#reloadAll
     * @returns {ModalHandler}
     */
}

module.exports = ModalHandler;

/**
 * Emitted when a modal is loaded.
 * @event ModalHandler#load
 * @param {Modal} modal - modal loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a modal is removed.
 * @event ModalHandler#remove
 * @param {Modal} modal - Modal removed.
 */
