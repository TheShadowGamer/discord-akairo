/* eslint-disable consistent-return */
const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { ContextHandlerEvents } = require('../../util/Constants');
const { Collection } = require('discord.js');
const Context = require('./Context');

class ContextHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = Context,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter
    } = {}) {
        if (!(classToHandle.prototype instanceof Context || classToHandle === Context)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Context.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Collecion of contexts.
         * @type {Collection<string, string>}
         */
        this.contexts = new Collection();

        /**
         * Inhibitor handler to use.
         * @type {?InhibitorHandler}
         */
        this.inhibitorHandler = null;

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', i => this.handle(i));
        });
    }

    /**
     * Registers a module.
     * @param {Context} context - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(context, filepath) {
        super.register(context, filepath);
        const name = context.name;
        const conflict = this.contexts.get(name.toLowerCase());
        if (conflict) throw new AkairoError('ALIAS_CONFLICT', name, context.id, conflict);

        this.contexts.set(name.toLowerCase(), context.id);
    }

    /**
     * Deregisters a module.
     * @param {Context} context - Module to use.
     * @returns {void}
     */
    deregister(context) {
        this.contexts.delete(context.name.toLowerCase());

        super.deregister(context);
    }

    /**
     * Handles a context interaction.
     * @param {ContextInteraction} interaction - ContextInteraction to handle.
     * @returns {Promise<?boolean>}
     */
    handle(interaction) {
        try {
            if (!interaction.isContextMenu()) return;
            const context = this.findContext(interaction.commandName);
            this.runContext(interaction, context);
        } catch (err) {
            this.emitError(err, interaction);
            return null;
        }
    }

    /**
     * Runs a context.
     * @param {ContextInteraction} interaction - ContextInteraction to handle.
     * @param {Context} context - Context to handle.
     * @returns {Promise<void>}
     */
    async runContext(interaction, context) {
        if (context.defer) {
            await interaction.deferReply({ ephemeral: context.deferEphemeral });
        }
        await context.exec(interaction);
    }

    /**
     * Handles errors from the handling.
     * @param {Error} err - The error.
     * @param {ContextInteraction} interaction - ContextInteraction that called the context.
     * @param {Context} [context] - Context that errored.
     * @returns {void}
     */
    emitError(err, interaction, context) {
        if (this.listenerCount(ContextHandlerEvents.ERROR)) {
            this.emit(ContextHandlerEvents.ERROR, err, interaction, context);
            return;
        }

        throw err;
    }

    /**
     * Finds a context by name.
     * @param {string} name - Name to find with.
     * @returns {Context}
     */
    findContext(name) {
        return this.modules.get(name.toLowerCase());
    }

    /**
     * Set the inhibitor handler to use.
     * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
     * @returns {ContextHandler}
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;

        return this;
    }

    /**
     * Set the listener handler to use.
     * @param {ListenerHandler} listenerHandler - The listener handler.
     * @returns {ContextHandler}
     */
    useListenerHandler(listenerHandler) {
        this.listenerHandler = listenerHandler;

        return this;
    }
}

module.exports = ContextHandler;
