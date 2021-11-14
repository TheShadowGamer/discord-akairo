/* eslint-disable consistent-return */
const AkairoError = require('../../util/AkairoError');
const AkairoHandler = require('../AkairoHandler');
const { BuiltInReasons, CommandHandlerEvents } = require('../../util/Constants');
const { Collection } = require('discord.js');
const Command = require('./Command');
const { isPromise } = require('../../util/Util');

/**
 * Loads commands and handles interactions.
 * @param {AkairoClient} client - The Akairo client.
 * @param {CommandHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class CommandHandler extends AkairoHandler {
    constructor(client, {
        directory,
        classToHandle = Command,
        extensions = ['.js', '.ts'],
        automateCategories,
        loadFilter,
        fetchMembers = false,
        defaultCooldown = 0,
        ignoreCooldown = client.ownerID,
        ignorePermissions = []
    } = {}) {
        if (!(classToHandle.prototype instanceof Command || classToHandle === Command)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Command.name);
        }

        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });

        /**
         * Collecion of commands.
         * @type {Collection<string, string>}
         */
        this.commands = new Collection();

        /**
         * Whether or not members are fetched on each interaction user from a guild.
         * @type {boolean}
         */
        this.fetchMembers = Boolean(fetchMembers);

        /**
         * Collection of cooldowns.
         * <info>The elements in the collection are objects with user IDs as keys
         * and {@link CooldownData} objects as values</info>
         * @type {Collection<string, Object>}
         */
        this.cooldowns = new Collection();

        /**
         * Default cooldown for commands.
         * @type {number}
         */
        this.defaultCooldown = defaultCooldown;

        /**
         * ID of user(s) to ignore cooldown or a function to ignore.
         * @type {Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignoreCooldown = typeof ignoreCooldown === 'function' ? ignoreCooldown.bind(this) : ignoreCooldown;

        /**
         * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
         * @type {Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignorePermissions = typeof ignorePermissions === 'function' ? ignorePermissions.bind(this) : ignorePermissions;

        /**
         * Collection of sets of ongoing argument prompts.
         * @type {Collection<string, Set<string>>}
         */
        this.prompts = new Collection();

        /**
         * Inhibitor handler to use.
         * @type {?InhibitorHandler}
         */
        this.inhibitorHandler = null;

        /**
         * Directory to commands.
         * @name CommandHandler#directory
         * @type {string}
         */

        /**
         * Commands loaded, mapped by ID to Command.
         * @name CommandHandler#modules
         * @type {Collection<string, Command>}
         */

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            this.client.on('interactionCreate', i => this.handle(i));
        });
    }

    /**
     * Registers a module.
     * @param {Command} command - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(command, filepath) {
        super.register(command, filepath);
        const name = command.name;
        const conflict = this.commands.get(name.toLowerCase());
        if (conflict) throw new AkairoError('ALIAS_CONFLICT', name, command.id, conflict);

        this.commands.set(name.toLowerCase(), command.id);
    }

    /**
     * Deregisters a module.
     * @param {Command} command - Module to use.
     * @returns {void}
     */
    deregister(command) {
        this.commands.delete(command.name.toLowerCase());

        super.deregister(command);
    }

    /**
     * Handles a command interaction.
     * @param {CommandInteraction} interaction - CommandInteraction to handle.
     * @returns {Promise<?boolean>}
     */
    async handle(interaction) {
        try {
            if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
            if (interaction.isCommand()) {
                if (this.fetchMembers && interaction.guild && !interaction.member) {
                    await interaction.guild.members.fetch(interaction.user);
                }

                const command = this.findCommand(interaction.commandName);

                if (await this.runPreTypeInhibitors(interaction)) {
                    return false;
                }

                const ran = await this.handleDirectCommand(interaction, command);

                return ran;
            }
            if (interaction.isAutocomplete()) {
                const command = this.findCommand(interaction.commandName);
                const ran = command.autocomplete(interaction);
                return ran;
            }
        } catch (err) {
            this.emitError(err, interaction);
            return null;
        }
    }

    /**
     * Handles normal commands.
     * @param {CommandInteraction} interaction - CommandInteraction to handle.
     * @param {Command} command - Command instance.
     * @param {boolean} [ignore=false] - Ignore inhibitors and other checks.
     * @returns {Promise<?boolean>}
     */
    async handleDirectCommand(interaction, command, ignore = false) {
        let key;
        try {
            if (!ignore) {
                if (await this.runPostTypeInhibitors(interaction, command)) return false;
            }

            const before = command.before(interaction);
            if (isPromise(before)) await before;

            if (!ignore) {
                if (command.lock) key = command.lock(interaction);
                if (isPromise(key)) key = await key;
                if (key) {
                    if (command.locker.has(key)) {
                        key = null;
                        this.emit(CommandHandlerEvents.COMMAND_LOCKED, interaction, command);
                        return true;
                    }

                    command.locker.add(key);
                }
            }

            return await this.runCommand(interaction, command);
        } catch (err) {
            this.emitError(err, interaction, command);
            return null;
        } finally {
            if (key) command.locker.delete(key);
        }
    }

    /**
     * Runs inhibitors with the pre type.
     * @param {CommandInteraction} interaction - CommandInteraction to handle.
     * @returns {Promise<boolean>}
     */
    async runPreTypeInhibitors(interaction) {
        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('pre', interaction)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.INTERACTION_BLOCKED, interaction, reason);
        } else {
            return false;
        }

        return true;
    }

    /**
     * Runs inhibitors with the post type.
     * @param {CommandInteraction} interaction - CommandInteraction to handle.
     * @param {Command} command - Command to handle.
     * @returns {Promise<boolean>}
     */
    async runPostTypeInhibitors(interaction, command) {
        if (command.ownerOnly) {
            const isOwner = this.client.isOwner(interaction.user.id);
            if (!isOwner) {
                this.emit(CommandHandlerEvents.COMMAND_BLOCKED, interaction, command, BuiltInReasons.OWNER);
                return true;
            }
        }

        if (command.channel === 'guild' && !interaction.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, interaction, command, BuiltInReasons.GUILD);
            return true;
        }

        if (command.channel === 'dm' && interaction.guild) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, interaction, command, BuiltInReasons.DM);
            return true;
        }

        if (await this.runPermissionChecks(interaction, command)) {
            return true;
        }

        const reason = this.inhibitorHandler
            ? await this.inhibitorHandler.test('post', interaction, command)
            : null;

        if (reason != null) {
            this.emit(CommandHandlerEvents.COMMAND_BLOCKED, interaction, command, reason);
            return true;
        }

        if (this.runCooldowns(interaction, command)) {
            return true;
        }

        return false;
    }

    /**
     * Runs permission checks.
     * @param {CommandInteraction} interaction - CommandInteraction that called the command.
     * @param {Command} command - Command to cooldown.
     * @returns {Promise<boolean>}
     */
    async runPermissionChecks(interaction, command) {
        if (command.clientPermissions) {
            if (typeof command.clientPermissions === 'function') {
                let missing = command.clientPermissions(interaction);
                if (isPromise(missing)) missing = await missing;

                if (missing != null) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, interaction, command, 'client', missing);
                    return true;
                }
            } else if (interaction.guild) {
                const missing = interaction.channel.permissionsFor(this.client.user).missing(command.clientPermissions);
                if (missing.length) {
                    this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, interaction, command, 'client', missing);
                    return true;
                }
            }
        }

        if (command.userPermissions) {
            const ignorer = command.ignorePermissions || this.ignorePermissions;
            const isIgnored = Array.isArray(ignorer)
                ? ignorer.includes(interaction.user.id)
                : typeof ignorer === 'function'
                    ? ignorer(interaction, command)
                    : interaction.user.id === ignorer;

            if (!isIgnored) {
                if (typeof command.userPermissions === 'function') {
                    let missing = command.userPermissions(interaction);
                    if (isPromise(missing)) missing = await missing;

                    if (missing != null) {
                        this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, interaction, command, 'user', missing);
                        return true;
                    }
                } else if (interaction.guild) {
                    const missing = interaction.channel.permissionsFor(interaction.user).missing(command.userPermissions);
                    if (missing.length) {
                        this.emit(CommandHandlerEvents.MISSING_PERMISSIONS, interaction, command, 'user', missing);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param {CommandInteraction} interaction - CommandInteraction that called the command.
     * @param {Command} command - Command to cooldown.
     * @returns {boolean}
     */
    runCooldowns(interaction, command) {
        const ignorer = command.ignoreCooldown || this.ignoreCooldown;
        const isIgnored = Array.isArray(ignorer)
            ? ignorer.includes(interaction.user.id)
            : typeof ignorer === 'function'
                ? ignorer(interaction, command)
                : interaction.user.id === ignorer;

        if (isIgnored) return false;

        const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;
        if (!time) return false;

        const endTime = interaction.createdTimestamp + time;

        const id = interaction.user.id;
        if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

        if (!this.cooldowns.get(id)[command.id]) {
            this.cooldowns.get(id)[command.id] = {
                timer: setTimeout(() => {
                    if (this.cooldowns.get(id)[command.id]) {
                        clearTimeout(this.cooldowns.get(id)[command.id].timer);
                    }
                    this.cooldowns.get(id)[command.id] = null;

                    if (!Object.keys(this.cooldowns.get(id)).length) {
                        this.cooldowns.delete(id);
                    }
                }, time).unref(),
                end: endTime,
                uses: 0
            };
        }

        const entry = this.cooldowns.get(id)[command.id];

        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(interaction.user.id)[command.id].end;
            const diff = end - interaction.createdTimestamp;

            this.emit(CommandHandlerEvents.COOLDOWN, interaction, command, diff);
            return true;
        }

        entry.uses++;
        return false;
    }

    /**
     * Runs a command.
     * @param {CommandInteraction} interaction - CommandInteraction to handle.
     * @param {Command} command - Command to handle.
     * @returns {Promise<void>}
     */
    async runCommand(interaction, command) {
        if (command.defer) {
            await interaction.deferReply({ ephemeral: command.deferEphemeral });
        }

        this.emit(CommandHandlerEvents.COMMAND_STARTED, interaction, command);
        const ret = await command.exec(interaction);
        this.emit(CommandHandlerEvents.COMMAND_FINISHED, interaction, command, ret);
    }

    /**
     * Register all of the bots commands
     * @returns {void}
     */
    async registerCommands() {
        const cmds = await this.client.application.commands.fetch();
        return cmds;
    }

    /**
     * Handles errors from the handling.
     * @param {Error} err - The error.
     * @param {CommandInteraction} interaction - CommandInteraction that called the command.
     * @param {Command} [command] - Command that errored.
     * @returns {void}
     */
    emitError(err, interaction, command) {
        if (this.listenerCount(CommandHandlerEvents.ERROR)) {
            this.emit(CommandHandlerEvents.ERROR, err, interaction, command);
            return;
        }

        throw err;
    }

    /**
     * Finds a command by name.
     * @param {string} name - Name to find with.
     * @returns {Command}
     */
    findCommand(name) {
        return this.modules.get(name.toLowerCase());
    }

    /**
     * Set the inhibitor handler to use.
     * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
     * @returns {CommandHandler}
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;

        return this;
    }

    /**
     * Set the listener handler to use.
     * @param {ListenerHandler} listenerHandler - The listener handler.
     * @returns {CommandHandler}
     */
    useListenerHandler(listenerHandler) {
        this.listenerHandler = listenerHandler;

        return this;
    }

    /**
     * Loads a command.
     * @method
     * @name CommandHandler#load
     * @param {string|Command} thing - Module or path to module.
     * @returns {Command}
     */

    /**
     * Reads all commands from the directory and loads them.
     * @method
     * @name CommandHandler#loadAll
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * @returns {CommandHandler}
     */

    /**
     * Removes a command.
     * @method
     * @name CommandHandler#remove
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Removes all commands.
     * @method
     * @name CommandHandler#removeAll
     * @returns {CommandHandler}
     */

    /**
     * Reloads a command.
     * @method
     * @name CommandHandler#reload
     * @param {string} id - ID of the command.
     * @returns {Command}
     */

    /**
     * Reloads all commands.
     * @method
     * @name CommandHandler#reloadAll
     * @returns {CommandHandler}
     */
}

module.exports = CommandHandler;

/**
 * Emitted when a message is blocked by a pre-message inhibitor.
 * The built-in inhibitors are 'client' and 'bot'.
 * @event CommandHandler#interactionBlocked
 * @param {CommandInteraction} interaction - Interaction ran.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command is found disabled.
 * @event CommandHandler#commandDisabled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command found.
 */

/**
 * Emitted when a command is blocked by a post-message inhibitor.
 * The built-in inhibitors are 'owner', 'guild', and 'dm'.
 * @event CommandHandler#commandBlocked
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command starts execution.
 * @event CommandHandler#commandStarted
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {any} args - The args passed to the command.
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {any} args - The args passed to the command.
 * @param {any} returnValue - The command's return value.
 */

/**
 * Emitted when a command is cancelled via prompt or argument cancel.
 * @event CommandHandler#commandCancelled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {?Message} retryMessage - Message to retry with.
 * This is passed when a prompt was broken out of with a message that looks like a command.
 */

/**
 * Emitted when a command is found on cooldown.
 * @event CommandHandler#cooldown
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {number} remaining - Remaining time in milliseconds for cooldown.
 */

/**
 * Emitted when a user is in a command argument prompt.
 * Used to prevent usage of commands during a prompt.
 * @event CommandHandler#inPrompt
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a permissions check is failed.
 * @event CommandHandler#missingPermissions
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} type - Either 'client' or 'user'.
 * @param {any} missing - The missing permissions.
 */

/**
 * Emitted when a command or inhibitor errors.
 * @event CommandHandler#error
 * @param {Error} error - The error.
 * @param {Message} message - Message sent.
 * @param {?Command} command - Command executed.
 */

/**
 * Emitted when a command is loaded.
 * @event CommandHandler#load
 * @param {Command} command - Module loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a command is removed.
 * @event CommandHandler#remove
 * @param {Command} command - Command removed.
 */

/**
 * Also includes properties from AkairoHandlerOptions.
 * @typedef {AkairoHandlerOptions} CommandHandlerOptions
 * @prop {boolean} [fetchMembers=false] - Whether or not to fetch member on each message from a guild.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignoreCooldown] - ID of user(s) to ignore cooldown or a function to ignore.
 * Defaults to the client owner(s).
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignorePermissions=[]] - ID of user(s) to ignore `userPermissions` checks or a function to ignore.
 */

/**
 * Data for managing cooldowns.
 * @typedef {Object} CooldownData
 * @prop {Timeout} timer - Timeout object.
 * @prop {number} end - When the cooldown ends.
 * @prop {number} uses - Number of times the command has been used.
 */

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @typedef {Function} IgnoreCheckPredicate
 * @param {Message} message - Message to check.
 * @param {Command} command - Command to check.
 * @returns {boolean}
 */
