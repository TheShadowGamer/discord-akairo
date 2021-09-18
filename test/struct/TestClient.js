const { AkairoClient, CommandHandler, ListenerHandler } = require('../../src/index');

class TestClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '123992700587343872'
        }, {
            intents: []
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './test/commands/',
            ignoreCooldownID: ['132266422679240704']
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './test/listeners/'
        });

        this.setup();
    }

    setup() {
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }

    async start(token) {
        await this.login(token);
        console.log('Ready!'); // eslint-disable-line no-console
    }
}

module.exports = TestClient;
