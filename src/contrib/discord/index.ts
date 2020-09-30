import Discord, { Guild, TextChannel } from 'discord.js';

/**
 * Truncates a value to the maximum length and wraps it in code markdown tags (```).
 */
export function truncatedEmbedCodeField(
    {name, value, inline}: {name: string, value: string, inline?: boolean}, 
    {maxLength}: {maxLength: number} = {maxLength: 1024}
): Discord.EmbedFieldData {
    const prefix = '```\n';
    const suffix = '\n```';
    const max = maxLength - (prefix.length + suffix.length);
    return {
        name,
        inline,
        value: prefix + (value.length > max ? value.substring(0, max) : value) + suffix,
    };
}

/* istanbul ignore next */
/**
 * Uniform exit handing (logout from discord & safely exit)
 */
export class ShutdownManager {
    constructor(private readonly client: Discord.Client) {
    }

    async exit(code = 0) {
        try {
            this.client.destroy();
        }
        finally {
            process.exit(code);
        }
    }

    addGlobalSignalListeners() {
        process.on('SIGINT', () => this.exit());
        process.on('SIGABRT', () => this.exit());
        process.on('SIGTERM', () => this.exit());
    }
}

export class MessageHelpers {
    public static withoutMentions(message: {content: string}) {
        return message.content.replace(/<@!\d+>/g, '').trim();
    }
}

export function getGuildUrl(guild: Guild | string, channel?: Discord.Channel | string) {
    const guildId = typeof guild === 'string' ? guild : guild.id;
    const channelId = channel ? (typeof channel === 'string' ? channel : channel.id) : null;
    return `https://discord.com/channels/${guildId}${channelId ? '/' + channelId : ''}`;
}

export async function getAllChannelMessages(channel: TextChannel, sort = true) {
    let before = undefined;
    const count = 100;
    const result: Discord.Message[] = [];
    while (true) {
        const batch: Discord.Message[] = (await channel.messages.fetch({ limit: count, before })).array();
        if (batch.length == 0) {
            break;
        }
        result.push(...batch);
        before = batch[batch.length - 1].id;
    }

    if (sort) {
        result.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    }

    return result;
}