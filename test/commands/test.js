/* eslint-disable no-console */

const { Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            name: 'test'
        });
    }

    exec(interaction) {
        interaction.reply('test');
    }
}

module.exports = TestCommand;
