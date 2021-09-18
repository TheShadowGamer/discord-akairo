const AkairoError = require('../../util/AkairoError');
const AkairoModule = require('../AkairoModule');

/**
 * Represents a command.
 * @param {string} id - Command ID.
 * @param {CommandOptions} [options={}] - Options for the command.
 * @extends {AkairoModule}
 */
class Command extends AkairoModule {
    constructor(id, options = {}) {
        super(id, { category: options.category });

        const {
            args = this.args || [],
            channel = null,
            ownerOnly = false,
            editable = true,
            defer = false,
            deferEphemeral = false,
            cooldown = null,
            ratelimit = 1,
            description = '',
            name,
            clientPermissions = this.clientPermissions,
            userPermissions = this.userPermissions,
            regex = this.regex,
            condition = this.condition || (() => false),
            before = this.before || (() => undefined),
            lock,
            ignoreCooldown,
            ignorePermissions
        } = options;

        /**
		 * The name of the command.
		 * @type {string}
		 */
        this.name = name;

        /**
		 * The options of the command.
		 * @type {CommandInteractionOption}
		 */
        this.args = args;

        /**
		 * Wether or not to defer the interaction
		 * @type {boolean}
		 */
        this.defer = Boolean(defer);

        /**
		 * Wether or not the defer should be ephemeral
		 * @type {boolean}
		 */
        this.deferEphemeral = Boolean(deferEphemeral);

        /**
         * Usable only in this channel type.
         * @type {?string}
         */
        this.channel = channel;

        /**
         * Usable only by the client owner.
         * @type {boolean}
         */
        this.ownerOnly = Boolean(ownerOnly);

        /**
         * Whether or not this command can be ran by an edit.
         * @type {boolean}
         */
        this.editable = Boolean(editable);

        /**
         * Cooldown in milliseconds.
         * @type {?number}
         */
        this.cooldown = cooldown;

        /**
         * Uses allowed before cooldown.
         * @type {number}
         */
        this.ratelimit = ratelimit;

        /**
         * Description of the command.
         * @type {string|any}
         */
        this.description = Array.isArray(description) ? description.join('\n') : description;

        /**
         * Permissions required to run command by the client.
         * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
         */
        this.clientPermissions = typeof clientPermissions === 'function' ? clientPermissions.bind(this) : clientPermissions;

        /**
         * Permissions required to run command by the user.
         * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
         */
        this.userPermissions = typeof userPermissions === 'function' ? userPermissions.bind(this) : userPermissions;

        /**
         * The regex trigger for this command.
         * @type {RegExp|RegexSupplier}
         */
        this.regex = typeof regex === 'function' ? regex.bind(this) : regex;

        /**
         * Checks if the command should be ran by using an arbitrary condition.
         * @method
         * @param {CommandInteraction} command - CommandInteraction being handled.
         * @returns {boolean}
         */
        this.condition = condition.bind(this);

        /**
         * Runs before execution.
         * @method
         * @param {CommandInteraction} command - Command being handled.
         * @returns {any}
         */
        this.before = before.bind(this);

        /**
         * The key supplier for the locker.
         * @type {?KeySupplier}
         */
        this.lock = lock;

        if (typeof lock === 'string') {
            this.lock = {
                guild: interaction => interaction.guild && interaction.guild.id,
                channel: interaction => interaction.channel.id,
                user: interaction => interaction.user.id
            }[lock];
        }

        if (this.lock) {
            /**
             * Stores the current locks.
             * @type {?Set<string>}
             */
            this.locker = new Set();
        }

        /**
         * ID of user(s) to ignore cooldown or a function to ignore.
         * @type {?Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignoreCooldown = typeof ignoreCooldown === 'function' ? ignoreCooldown.bind(this) : ignoreCooldown;

        /**
         * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
         * @type {?Snowflake|Snowflake[]|IgnoreCheckPredicate}
         */
        this.ignorePermissions = typeof ignorePermissions === 'function' ? ignorePermissions.bind(this) : ignorePermissions;

        /**
         * The ID of this command.
         * @name Command#id
         * @type {string}
         */

        /**
         * The command handler.
         * @name Command#handler
         * @type {CommandHandler}
         */
    }

    /**
     * Executes the command.
     * @abstract
     * @param {CommandInteraction} interaction - CommandInteraction that triggered the command.
     * @returns {any}
     */
    exec() {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }

    /**
     * Reloads the command.
     * @method
     * @name Command#reload
     * @returns {Command}
     */

    /**
     * Removes the command.
     * @method
     * @name Command#remove
     * @returns {Command}
     */
}

module.exports = Command;

/**
 * Options to use for command execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} CommandOptions
 * @prop {CommandInteractionOption[]} [args=[]] - Argument options.
 * @prop {boolean} [quoted=true] - Whether or not to consider quotes.
 * @prop {string} [channel] - Restricts channel to either 'guild' or 'dm'.
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [typing=false] - Whether or not to type in channel during execution.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier} [userPermissions] - Permissions required by the user to run this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier} [clientPermissions] - Permissions required by the client to run this command.
 * @prop {BeforeAction} [before] - Function to run before execution.
 * @prop {KeySupplier|string} [lock] - The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user'.
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignoreCooldown] - ID of user(s) to ignore cooldown or a function to ignore.
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignorePermissions] - ID of user(s) to ignore `userPermissions` checks or a function to ignore.
 * @prop {string} [description=''] - Description of the command.
 */

/**
 * A function to run before execution.
 * @typedef {Function} BeforeAction
 * @param {CommandInteraction} interaction - CommandInteraction that triggered the command.
 * @returns {any}
 */

/**
 * A function used to supply the key for the locker.
 * @typedef {Function} KeySupplier
 * @param {CommandInteraction} interaction - Interaction that triggered the command.
 * @param {any} args - Evaluated arguments.
 * @returns {string}
 */

/**
 * A function used to check if a command has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @typedef {Function} MissingPermissionSupplier
 * @param {CommandInteraction} interaction - CommandInteraction that triggered the command.
 * @returns {any}
 */
