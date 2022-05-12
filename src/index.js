module.exports = {
    // Core
    AkairoClient: require('./struct/AkairoClient'),
    AkairoHandler: require('./struct/AkairoHandler'),
    AkairoModule: require('./struct/AkairoModule'),
    ClientUtil: require('./struct/ClientUtil'),

    // Commands
    Command: require('./struct/commands/Command'),
    CommandHandler: require('./struct/commands/CommandHandler'),

    // Inhibitors
    Inhibitor: require('./struct/inhibitors/Inhibitor'),
    InhibitorHandler: require('./struct/inhibitors/InhibitorHandler'),

    // Listeners
    Listener: require('./struct/listeners/Listener'),
    ListenerHandler: require('./struct/listeners/ListenerHandler'),

    // Buttons
    Button: require('./struct/buttons/Button'),
    ButtonHandler: require('./struct/buttons/ButtonHandler'),

    // Modals
    Modal: require('./struct/modals/Modal'),
    ModalHandler: require('./struct/modals/ModalHandler'),

    // Contexts

    Context: require('./struct/context/Context'),
    ContextHanlder: require('./struct/context/ContextHandler'),

    // Selects
    Select: require('./struct/selects/Select'),
    SelectHandler: require('./struct/selects/SelectHandler'),

    // Utilities
    AkairoError: require('./util/AkairoError'),
    Category: require('./util/Category'),
    Constants: require('./util/Constants'),
    Util: require('./util/Util'),
    version: require('../package.json').version
};
