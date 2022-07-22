const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { ButtonHandlerEvents: { BUTTON_INVALID } } = require('../../util/Constants');
const Button = require('./Button');

/**
 * Loads listeners and registers them with EventEmitters.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class ButtonHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = Button,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter
    } = {}) {
        if (!(classToHandle.prototype instanceof Button || classToHandle === Button)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Button.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Directory to button listeners.
         * @name ButtonHandler#directory
         * @type {string}
         */

        /**
         * Button listeners loaded, mapped by ID to Button Listener.
         * @name ButtonHandler#modules
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
     * @param {Button} button - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(button, filepath) {
        super.register(button, filepath);
        button.exec = button.exec.bind(button);
        return button;
    }

    /**
     * Deregisters a module.
     * @param {Button} button - Module to use.
     * @returns {void}
     */
    deregister(button) {
        super.deregister(button);
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', i => {
                if (!i.isButton()) return;
                this.handle(i);
            });
        });
    }

    /**
     * Handles a button.
     * @param {Interaction} interaction - Button to handle.
     * @returns {Promise<?boolean>}
     */
    async handle(interaction) {
        try {
            const args = interaction.customId.split('_');
            const btn = this.modules.find(listener => args[0] === listener.buttonId);
            args.shift();
            btn.exec(interaction, await btn.args(args));
            return true;
        } catch (err) {
            this.emit(BUTTON_INVALID, interaction);
            return null;
        }
    }

    /**
     * Loads a Button.
     * @method
     * @name ButtonHandler#load
     * @param {string|Listener} thing - Module or path to module.
     * @returns {Button}
     */

    /**
     * Reads all buttons from the directory and loads them.
     * @method
     * @name ButtonHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * @returns {ButtonHandler}
     */

    /**
     * Removes a button.
     * @method
     * @name ButtonHandler#remove
     * @param {string} id - ID of the button.
     * @returns {Button}
     */

    /**
     * Removes all buttons.
     * @method
     * @name ButtonHandler#removeAll
     * @returns {ButtonHandler}
     */

    /**
     * Reloads a button.
     * @method
     * @name ButtonHandler#reload
     * @param {string} id - ID of the button.
     * @returns {Button}
     */

    /**
     * Reloads all buttons.
     * @method
     * @name ButtonHandler#reloadAll
     * @returns {ButtonHandler}
     */
}

module.exports = ButtonHandler;

/**
 * Emitted when a button is loaded.
 * @event ButtonHandler#load
 * @param {Button} button - button loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a button is removed.
 * @event ButtonHandler#remove
 * @param {Button} button - Button removed.
 */
