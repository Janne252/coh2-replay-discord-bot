import fs from 'fs-extra';

/**
 * Represents a a wrapper class that provides localized strings from a RelicCOH2.<language>.ucs file.
 */
export class Locale {
    private readonly messages: Record<string, string> = {};
    /**
     * @param idPrefix Prefixed added to each message ID. Defaults to '$'.
     */
    constructor(private readonly idPrefix = '$') {

    }

    async init(filepath: string) {
        const localeStrings = (await fs.readFile(filepath, {encoding: 'utf-8'})).split('\n');
        for (const row of localeStrings) {
            const [id, message] = row.split('\t').map(part => part.trim());
            this.messages[`${this.idPrefix}${id}`] = message;
        }
    }

    get(id: string) {
        return this.messages[id];
    }
}

export interface LocaleLike {
    get(id: string): string;
}