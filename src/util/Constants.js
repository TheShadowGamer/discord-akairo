module.exports = {
    AkairoHandlerEvents: {
        LOAD: 'load',
        REMOVE: 'remove'
    },
    CommandHandlerEvents: {
        INTERACTION_BLOCKED: 'interactionBlocked',
        COMMAND_BLOCKED: 'commandBlocked',
        COMMAND_STARTED: 'commandStarted',
        COMMAND_FINISHED: 'commandFinished',
        COMMAND_CANCELLED: 'commandCancelled',
        COMMAND_LOCKED: 'commandLocked',
        MISSING_PERMISSIONS: 'missingPermissions',
        COOLDOWN: 'cooldown',
        ERROR: 'error'
    },
    ButtonHandlerEvents: {
        BUTTON_INVALID: 'buttonInvalid'
    },
    SelectHandlerEvents: {
        SELECT_INVALID: 'selectInvalid'
    },
    BuiltInReasons: {
        CLIENT: 'client',
        BOT: 'bot',
        OWNER: 'owner',
        GUILD: 'guild',
        DM: 'dm'
    }
};
