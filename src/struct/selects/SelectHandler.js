const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { SelectHandlerEvents: { SELECT_INVALID } } = require('../../util/Constants');
const Select = require('./Select');

/**
 * Loads listeners and registers them with EventEmitters.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class SelectHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = Select,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter
    } = {}) {
        if (!(classToHandle.prototype instanceof Select || classToHandle === Select)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Select.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Directory to select listeners.
         * @name SelectHandler#directory
         * @type {string}
         */

        /**
         * Select listeners loaded, mapped by ID to Select Listener.
         * @name SelectHandler#modules
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
     * @param {Select} select - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(select, filepath) {
        super.register(select, filepath);
        select.exec = select.exec.bind(select);
        return select;
    }

    /**
     * Deregisters a module.
     * @param {Select} select - Module to use.
     * @returns {void}
     */
    deregister(select) {
        super.deregister(select);
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', i => {
                if (!i.isSelectMenu()) return;
                this.handle(i);
            });
        });
    }

    /**
     * Handles a select.
     * @param {Interaction} interaction - Select to handle.
     * @returns {Promise<?boolean>}
     */
    async handle(interaction) {
        try {
            const args = interaction.customId.split('_');
            const select = this.modules.find(listener => args[0] === listener.selectId);
            args.shift();
            select.exec(interaction, await select.args(args));
            return true;
        } catch (err) {
            this.emit(SELECT_INVALID, interaction);
            return null;
        }
    }

    /**
     * Loads a Select.
     * @method
     * @name SelectHandler#load
     * @param {string|Listener} thing - Module or path to module.
     * @returns {Select}
     */

    /**
     * Reads all selects from the directory and loads them.
     * @method
     * @name SelectHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * @returns {SelectHandler}
     */

    /**
     * Removes a select.
     * @method
     * @name SelectHandler#remove
     * @param {string} id - ID of the select.
     * @returns {Select}
     */

    /**
     * Removes all selects.
     * @method
     * @name SelectHandler#removeAll
     * @returns {SelectHandler}
     */

    /**
     * Reloads a select.
     * @method
     * @name SelectHandler#reload
     * @param {string} id - ID of the select.
     * @returns {Select}
     */

    /**
     * Reloads all Selects.
     * @method
     * @name SelectHandler#reloadAll
     * @returns {SelectHandler}
     */
}

module.exports = SelectHandler;

/**
 * Emitted when a select is loaded.
 * @event SelectHandler#load
 * @param {Select} select - select loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a select is removed.
 * @event SelectHandler#remove
 * @param {Select} select - Select removed.
 */
