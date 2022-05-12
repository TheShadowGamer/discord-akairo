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
    ContextHandlerEvents: {
        ERROR: 'error'
    },
    ButtonHandlerEvents: {
        BUTTON_INVALID: 'buttonInvalid'
    },
    ModalHandlerEvents: {
        MODAL_INVALID: 'modalInvalid'
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
