declare module 'discord-akairo' {
    import {
        BufferResolvable, Client, ClientOptions, Collection, CommandInteraction,
        MessageAttachment, MessageEmbed, MessageButton, MessageOptions,
        MessageSelectMenu, MessageActionRow, User, UserResolvable, GuildMember,
        Channel, Role, Emoji, Guild, AutocompleteInteraction,
        PermissionResolvable, Snowflake, ApplicationCommandOptionData
    } from 'discord.js';

    import { EventEmitter } from 'events';
    import { Stream } from 'stream';

    module 'discord.js' {}

    export class AkairoError extends Error {
        public code: string;
    }

    export class AkairoClient extends Client {
        public constructor(options?: AkairoOptions & ClientOptions);
        public constructor(options: AkairoOptions, clientOptions: ClientOptions);

        public ownerID: Snowflake | Snowflake[];
        public util: ClientUtil;

        public isOwner(user: UserResolvable): boolean;
    }

    export class AkairoHandler extends EventEmitter {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public automateCategories: boolean;
        public extensions: Set<string>;
        public categories: Collection<string, Category<string, AkairoModule>>;
        public classToHandle: Function;
        public client: AkairoClient;
        public directory: string;
        public loadFilter: LoadPredicate;
        public modules: Collection<string, AkairoModule>;

        public deregister(mod: AkairoModule): void;
        public findCategory(name: string): Category<string, AkairoModule>;
        public load(thing: string | Function, isReload?: boolean): AkairoModule;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(mod: AkairoModule, filepath?: string): void;
        public reload(id: string): AkairoModule;
        public reloadAll(): this;
        public remove(id: string): AkairoModule;
        public removeAll(): this;
        public on(event: 'remove', listener: (mod: AkairoModule) => any): this;
        public on(event: 'load', listener: (mod: AkairoModule, isReload: boolean) => any): this;

        public static readdirRecursive(directory: string): string[];
    }

    export class AkairoModule {
        public constructor(id: string, options?: AkairoModuleOptions);

        public category: Category<string, AkairoModule>;
        public categoryID: string;
        public client: AkairoClient;
        public filepath: string;
        public handler: AkairoHandler;
        public id: string;

        public reload(): this;
        public remove(): this;
    }

    export class Category<K, V> extends Collection<K, V> {
        public constructor(id: string, iterable?: Iterable<[K, V][]>);

        public id: string;

        public reloadAll(): this;
        public removeAll(): this;
    }

    export class ClientUtil {
        public constructor(client: AkairoClient);

        public readonly client: AkairoClient;

        public attachment(file: BufferResolvable | Stream, name?: string): MessageAttachment;
        public checkChannel(text: string, channel: Channel, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public collection<K, V>(iterable?: Iterable<[K, V][]>): Collection<K, V>;
        public compareStreaming(oldMember: GuildMember, newMember: GuildMember): number;
        public embed(data?: object): MessageEmbed;
        public button(data?: object): MessageButton;
        public select(data?: object): MessageSelectMenu;
        public row(data?: object): MessageActionRow;
        public fetchMember(guild: Guild, id: string, cache?: boolean): Promise<GuildMember>;
        public resolveChannel(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Channel;
        public resolveChannels(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Channel>;
        public resolveEmoji(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji;
        public resolveEmojis(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Emoji>;
        public resolveGuild(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild;
        public resolveGuilds(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Guild>;
        public resolveMember(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember;
        public resolveMembers(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, GuildMember>;
        public resolvePermissionNumber(number: number): string[];
        public resolveRole(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role;
        public resolveRoles(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Role>;
        public resolveUser(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): User;
        public resolveUsers(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, User>;
    }

    export class Command extends AkairoModule {
        public constructor(id: string, options?: CommandOptions);

        public quoted: boolean;
        public category: Category<string, Command>;
        public channel?: string;
        public client: AkairoClient;
        public clientPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        public cooldown?: number;
        public description: string | any;
        public editable: boolean;
        public filepath: string;
        public handler: CommandHandler;
        public id: string;
        public lock?: KeySupplier;
        public locker?: Set<string>;
        public ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ownerOnly: boolean;
        public ratelimit: number;
        public userPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

        public before(interaction: CommandInteraction): any;
        public condition(interaction: CommandInteraction): boolean;
        public exec(interaction: CommandInteraction): any;
		public autocomplete?(interaction: AutocompleteInteraction): any;
        public reload(): this;
        public remove(): this;
    }

    export class CommandHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: CommandHandlerOptions);

        public commands: Collection<string, string>;
        public categories: Collection<string, Category<string, Command>>;
        public classToHandle: typeof Command;
        public client: AkairoClient;
        public cooldowns: Collection<string, { [id: string]: CooldownData }>;
        public defaultCooldown: number;
        public directory: string;
        public fetchMembers: boolean;
        public ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public inhibitorHandler?: InhibitorHandler;
        public modules: Collection<string, Command>;

        public add(filename: string): Command;
        public deregister(command: Command): void;
        public emitError(err: Error, interaction: CommandInteraction, command?: Command): void;
        public findCategory(name: string): Category<string, Command>;
        public findCommand(name: string): Command;
        public handle(interaction: CommandInteraction): Promise<boolean | null>;
        public handleDirectCommand(interaction: CommandInteraction, content: string, command: Command, ignore?: boolean): Promise<boolean | null>;
        public load(thing: string | Function, isReload?: boolean): Command;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(command: Command, filepath?: string): void;
        public reload(id: string): Command;
        public reloadAll(): this;
        public remove(id: string): Command;
        public removeAll(): this;
        public runPermissionChecks(interaction: CommandInteraction, command: Command): Promise<boolean>;
        public runPreTypeInhibitors(interaction: CommandInteraction): Promise<boolean>;
        public runPostTypeInhibitors(interaction: CommandInteraction, command: Command): Promise<boolean>;
        public runCooldowns(interaction: CommandInteraction, command: Command): boolean;
        public runCommand(interaction: CommandInteraction, command: Command): Promise<void>;
        public useInhibitorHandler(inhibitorHandler: InhibitorHandler): this;
        public useListenerHandler(ListenerHandler: ListenerHandler): this;
        public on(event: 'remove', listener: (command: Command) => any): this;
        public on(event: 'load', listener: (command: Command, isReload: boolean) => any): this;
        public on(event: 'commandBlocked', listener: (interaction: CommandInteraction, command: Command, reason: string) => any): this;
        public on(event: 'commandFinished', listener: (interaction: CommandInteraction, command: Command, args: any, returnValue: any) => any): this;
        public on(event: 'commandLocked', listener: (interaction: CommandInteraction, command: Command) => any): this;
        public on(event: 'commandStarted', listener: (interaction: CommandInteraction, command: Command, args: any) => any): this;
        public on(event: 'cooldown', listener: (interaction: CommandInteraction, command: Command, remaining: number) => any): this;
        public on(event: 'error', listener: (error: Error, interaction: CommandInteraction, command?: Command) => any): this;
        public on(event: 'interactionBlocked', listener: (interaction: CommandInteraction, reason: string) => any): this;
        public on(event: 'missingPermissions', listener: (interaction: CommandInteraction, command: Command, type: 'client' | 'user', missing?: any) => any): this;
    }

    export class Flag {
        public constructor(type: string, data: object);

        public type: string;

        public static cancel(): Flag;
        public static continue(command: string, ignore?: boolean, rest?: string): Flag & { command: string, ignore: boolean, rest: string };
        public static retry(interaction: CommandInteraction): Flag & { interaction: CommandInteraction };
        public static fail(value: any): Flag & { value: any };
        public static is(value: any, type: 'cancel'): value is Flag;
        public static is(value: any, type: 'continue'): value is Flag & { command: string, ignore: boolean, rest: string };
        public static is(value: any, type: 'retry'): value is Flag & { interaction: CommandInteraction };
        public static is(value: any, type: 'fail'): value is Flag & { value: any };
        public static is(value: any, type: string): value is Flag;
    }

    export class Inhibitor extends AkairoModule {
        public constructor(id: string, options?: InhibitorOptions);

        public category: Category<string, Inhibitor>;
        public client: AkairoClient;
        public filepath: string;
        public handler: InhibitorHandler;
        public id: string;
        public reason: string;
        public type: string;

        public exec(interaction: CommandInteraction, command?: Command): boolean | Promise<boolean>;
        public reload(): this;
        public remove(): this;
    }

    export class InhibitorHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Inhibitor>>;
        public classToHandle: typeof Inhibitor;
        public client: AkairoClient;
        public directory: string;
        public modules: Collection<string, Inhibitor>;

        public deregister(inhibitor: Inhibitor): void;
        public findCategory(name: string): Category<string, Inhibitor>;
        public load(thing: string | Function): Inhibitor;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(inhibitor: Inhibitor, filepath?: string): void;
        public reload(id: string): Inhibitor;
        public reloadAll(): this;
        public remove(id: string): Inhibitor;
        public removeAll(): this;
        public test(type: 'all' | 'pre' | 'post', interaction: CommandInteraction, command?: Command): Promise<string | void>;
        public on(event: 'remove', listener: (inhibitor: Inhibitor) => any): this;
        public on(event: 'load', listener: (inhibitor: Inhibitor, isReload: boolean) => any): this;
    }

    export class Listener extends AkairoModule {
        public constructor(id: string, options?: ListenerOptions);

        public category: Category<string, Listener>;
        public client: AkairoClient;
        public emitter: string | EventEmitter;
        public event: string;
        public filepath: string;
        public handler: ListenerHandler;
        public type: string;

        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class ListenerHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Listener>>;
        public classToHandle: typeof Listener;
        public client: AkairoClient;
        public directory: string;
        public emitters: Collection<string, EventEmitter>;
        public modules: Collection<string, Listener>;

        public add(filename: string): Listener;
        public addToEmitter(id: string): Listener;
        public deregister(listener: Listener): void;
        public findCategory(name: string): Category<string, Listener>;
        public load(thing: string | Function): Listener;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(listener: Listener, filepath?: string): void;
        public reload(id: string): Listener;
        public reloadAll(): this;
        public remove(id: string): Listener;
        public removeAll(): this;
        public removeFromEmitter(id: string): Listener;
        public setEmitters(emitters: { [x: string]: EventEmitter }): void;
        public on(event: 'remove', listener: (listener: Listener) => any): this;
        public on(event: 'load', listener: (listener: Listener, isReload: boolean) => any): this;
    }

    export class Button extends AkairoModule {
        public constructor(id: string, options?: ButtonOptions)

        public category: Category<string, Listener>;
        public client: AkairoClient;
        public buttonId: string;
        public args: [];
        public filepath: string;
        public handler: ButtonHandler;

        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class ButtonHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Listener>>;
        public classToHandle: typeof Button;
        public client: AkairoClient;
        public directory: string;
        public modules: Collection<string, Listener>;

        public deregister(listener: Listener): void;
        public findCategory(name: string): Category<string, Listener>;
        public load(thing: string | Function): Listener;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(listener: Listener, filepath?: string): void;
        public reload(id: string): Listener;
        public reloadAll(): this;
        public remove(id: string): Listener;
        public removeAll(): this;
        public useCommandHandler(commandHandler: CommandHandler): this;
        public on(event: 'remove', listener: (listener: Listener) => any): this;
        public on(event: 'load', listener: (listener: Listener, isReload: boolean) => any): this;
    }

    export class TypeResolver {
        public constructor(handler: CommandHandler);

        public client: AkairoClient;
        public commandHandler: CommandHandler;
        public inhibitorHandler?: InhibitorHandler;
        public listenerHandler?: ListenerHandler;
    }

    export class Util {
        public static isEventEmitter(value: any): boolean;
        public static isPromise(value: any): boolean;
    }

    export interface AkairoHandlerOptions {
        automateCategories?: boolean;
        classToHandle?: Function;
        directory?: string;
        extensions?: string[] | Set<string>;
        loadFilter?: LoadPredicate;
    }

    export interface AkairoModuleOptions {
        category?: string;
    }

    export interface AkairoOptions {
        ownerID?: Snowflake | Snowflake[];
    }

    export interface CommandOptions extends AkairoModuleOptions {
        name: string;
        args?: ApplicationCommandOptionData[];
        before?: BeforeAction;
        channel?: 'guild' | 'dm';
        clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        condition?: ExecutionPredicate;
        cooldown?: number;
        description?: string | any;
        editable?: boolean;
        flags?: string[];
        ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        lock?: KeySupplier | 'guild' | 'channel' | 'user';
        optionFlags?: string[];
        ownerOnly?: boolean;
        ratelimit?: number;
        separator?: string;
        defer?: boolean;
        deferEphemeral?: boolean;
        defaultPermission?: boolean;
        userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        quoted?: boolean;
    }

    export interface CommandHandlerOptions extends AkairoHandlerOptions {
        defaultCooldown?: number;
        fetchMembers?: boolean;
        ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    }

    export interface CooldownData {
        end: number;
        timer: NodeJS.Timer;
        uses: number;
    }

    export interface FailureData {
        phrase: string;
        failure: void | (Flag & { value: any });
    }

    export interface InhibitorOptions extends AkairoModuleOptions {
        reason?: string;
        type?: string;
        priority?: number;
    }

    export interface ListenerOptions extends AkairoModuleOptions {
        emitter: string | EventEmitter;
        event: string;
        type?: string;
    }

    export interface ButtonOptions extends AkairoModuleOptions {
        buttonId: string;
        args: [{id: string, type: string}];
    }

    export type BeforeAction = (interaction: CommandInteraction) => any;

    export type DefaultValueSupplier = (interaction: CommandInteraction, data: FailureData) => any;

    export type ExecutionPredicate = (interaction: CommandInteraction) => boolean;

    export type IgnoreCheckPredicate = (interaction: CommandInteraction, command: Command) => boolean;

    export type KeySupplier = (interaction: CommandInteraction, args: any) => string;

    export type LoadPredicate = (filepath: string) => boolean;

    export type MissingPermissionSupplier = (interaction: CommandInteraction) => Promise<any> | any;

    export type OtherwiseContentModifier = (interaction: CommandInteraction, text: string, data: FailureData)
        => string | MessageOptions | Promise<string | MessageOptions>;

    export type OtherwiseContentSupplier = (interaction: CommandInteraction, data: FailureData)
        => string | MessageOptions | Promise<string | MessageOptions>;

    export type ParsedValuePredicate = (interaction: CommandInteraction, phrase: string, value: any) => boolean;

    export const Constants: {
        AkairoHandlerEvents: {
            LOAD: 'load';
            REMOVE: 'remove';
        };
        CommandHandlerEvents: {
            INTERACTION_BLOCKED: 'interactionBlocked';
            COMMAND_BLOCKED: 'commandBlocked';
            COMMAND_STARTED: 'commandStarted';
            COMMAND_FINISHED: 'commandFinished';
            COMMAND_CANCELLED: 'commandCancelled';
            COMMAND_LOCKED: 'commandLocked';
            MISSING_PERMISSIONS: 'missingPermissions';
            COOLDOWN: 'cooldown';
            ERROR: 'error';
        };
        ButtonHandlerEvents: {
            BUTTON_INVALID: 'buttonInvalid';
        };
        BuiltInReasons: {
            CLIENT: 'client';
            BOT: 'bot';
            OWNER: 'owner';
            GUILD: 'guild';
            DM: 'dm';
        };
    };

    export const version: string;
}
