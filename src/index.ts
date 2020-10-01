import * as Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { Locale } from './contrib/coh2';
import ReplaysConfig from './commands/parse-replay/config';
import tryParseCoH2Replay from './commands/parse-replay';

import tryExecuteAdminCommand from './commands/admin';

import { ShutdownManager } from './contrib/discord';
import { DiagnosticsConfig } from './contrib/discord/config';
import { ChannelLogger, LogLevel } from './contrib/discord/logging';
import I18n from './contrib/i18n';

// Instances
const client = new Discord.Client({

});

export const i18n = new I18n(path.join(process.cwd(), 'locale'));
const coh2Locale = new Locale();
const diagnosticsConfig = new DiagnosticsConfig();
const replaysConfig = new ReplaysConfig();
const logger = new ChannelLogger(client, diagnosticsConfig);
const shutdownManager = new ShutdownManager(client, logger);

client.on('ready', async () => {
    await replaysConfig.init();
    await diagnosticsConfig.init();

    // Prepare .replays folder
    await fs.ensureDir(replaysConfig.replaysTempPath);
    await fs.emptyDir(replaysConfig.replaysTempPath);

    await Promise.all([
        coh2Locale.init(replaysConfig.localeFilePath),
        logger.init(),
        i18n.init(),
    ]);
   
    console.log('Ready!');

    const updateStatus = async () => {
        try {
            await client.user?.setActivity({
                name: i18n.get('watchingActivity'),
                type: 'WATCHING'
            });
        } finally {
            setTimeout(updateStatus, 30 * 60 * 1000);
        }
    }

    updateStatus();

    logger.log({
        title: 'Startup',
        description: `Process started.`
    }, {
        level: LogLevel.Log,
        environmentInfo: true,
    });
});

client.on('message', async message => {
    const restoreLocale = i18n.activate(message.guild?.preferredLocale as string);
    try {
        if (await tryParseCoH2Replay(message, client, logger, replaysConfig))
            return;
        
        if (await tryExecuteAdminCommand(message, client, logger, diagnosticsConfig))
            return;
    } catch (error) {
        // Catch errors with context
        await logger.error(error, message);
    } finally {
        restoreLocale();
    }
});

// Login with a locally stored utf8 encoded text file.
// This file is ignored in .gitignore
client.login(fs.readFileSync('.discord.token', {encoding: 'utf8'}).trim());
// Add global event listeners
logger.addGlobalErrorListeners();
// Add global signal listeners such as SIGTERM
shutdownManager.addGlobalSignalListeners();
