import assert from 'assert';
import {describe, it} from 'mocha';
import { formatChatMessage, formatPlayer, getPlayerListEmbed, getReplayDurationDisplay, getReplayTimestamp, ReplayChatMessage, resolveMapDisplayName, resolveScenarioId, splitChat } from './replay';
import * as factory from '../testing/factory';
import * as mocking from '../testing/mocking';
import { makeLength } from '../testing/generator';

describe('contrib.coh2.replay', () => {
    it('resolveMapDisplayName: From replay.map.name', () => {
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: 'Foo bar'}), mocking.Locale.Empty), 
            'Foo bar'
        );
    });
    
    it('resolveMapDisplayName: From replay.map.file', () => {
        // numeric player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 4, file: 'Data:/scenarios/mp/4p_some_map/4p_some_map'}), mocking.Locale.Empty), 
            '(4) Some map'
        );
        // numeric player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 4, file: 'Data:/scenarios/mp/4p_some_map/4P_some_map'}), mocking.Locale.Empty), 
            '(4) Some map'
        );
        // No player count 
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 4, file: 'Data:/scenarios/mp/some_map/some_map'}), mocking.Locale.Empty), 
            '(4) Some map'
        );
        // short player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 2, file: 'Data:/scenarios/mp/some map/(2)_some map'}), mocking.Locale.Empty), 
            '(2) Some map'
        );
        // verbose player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 6, file: 'Data:/scenarios/mp/some map/(4 - 6)_some-map'}), mocking.Locale.Empty), 
            '(6) Some map'
        );
        // no whitespace in player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 6, file: 'Data:/scenarios/mp/some map/(4-6)_some-map'}), mocking.Locale.Empty), 
            '(6) Some map'
        );
        // partial player count
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$124', players: 6, file: 'Data:/scenarios/mp/some map/(4-)_some-map'}), mocking.Locale.Empty), 
            '(6) Some map'
        );
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '', file: ''}), mocking.Locale.Empty), 
            ''
        );
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '', file: ''})), 
            ''
        );
    });

    it('resolveMapDisplayName: From locale', () => {
        assert.strictEqual(
            resolveMapDisplayName(factory.replay({name: '$1'}), new mocking.Locale({'$1': '(2) Map'})), 
            '(2) Map'
        );
    });

    it('resolveScenarioId', () => {
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data://scenarios\\mp\\2p_map//2p_map'})), 'scenarios-mp-2p-map-2p-map');
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data:\\scenarios\\mp\\2p_map\\2p_map'})), 'scenarios-mp-2p-map-2p-map');
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data:\\scenarios\\mp\\2p map\\2p map'})), 'scenarios-mp-2p-map-2p-map');
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data:\\scenarios\\mp\\2p _map\\2p map'})), 'scenarios-mp-2p-map-2p-map');
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data:\\scenarios\\mp\\2p--map\\2p map'})), 'scenarios-mp-2p-map-2p-map');
        assert.strictEqual(resolveScenarioId(factory.replay({file: 'Data:\\scenarios\\mp\\ _ 2p--map\\2p map'})), 'scenarios-mp-2p-map-2p-map');
    });

    it('getReplayTimestamp', () => {
        assert.strictEqual(getReplayTimestamp(0), '00:00:00');
        assert.strictEqual(getReplayTimestamp(34000), '01:10:50');
    });

    it('getReplayDurationDisplay', () => {
        assert.strictEqual(getReplayDurationDisplay(0), '0s');
        assert.strictEqual(getReplayDurationDisplay(34000), '1h 10m 50s');
        assert.strictEqual(getReplayDurationDisplay(34000, {verbose: true}), '1 hour 10 minutes 50 seconds');
        assert.strictEqual(getReplayDurationDisplay(12000, {verbose: true}), '25 minutes');
        assert.strictEqual(getReplayDurationDisplay(8, {verbose: true}), '1 second');
        assert.strictEqual(getReplayDurationDisplay(16, {verbose: true}), '2 seconds');
        assert.strictEqual(getReplayDurationDisplay(8 * 60, {verbose: true}), '1 minute');
        assert.strictEqual(getReplayDurationDisplay(8 * 3600, {verbose: true}), '1 hour');
        assert.strictEqual(getReplayDurationDisplay(8 * 3600 * 2, {verbose: true}), '2 hours');
    });

    it ('splitChat', () => {
        let chat: ReplayChatMessage[];
        assert.deepStrictEqual(
            splitChat({chat: [
                {name: 'player', tick: 0, message: 'Hi'},
            ]}),
            [{
                content: `||${formatChatMessage({name: 'player', tick: 0, message: 'Hi'})}||`,
                count: 1
            }]
        );
            
        // Last long chat message causes a split
        chat = [
            {name: 'player', tick: 0, message: 'Hi'},
            {name: 'player', tick: 0, message: 'Hey'},
            {name: 'player', tick: 0, message: 'Yo yo what is going on'},
            {name: 'player', tick: 0, message: makeLength('foo bar', 1024)},
        ];
        assert.deepStrictEqual(
            splitChat({chat}),
            [
                { content: `||${[chat[0], chat[1], chat[2]].map(o => formatChatMessage(o)).join('')}||`, count: 3},
                { content: `||${formatChatMessage(chat[3])}||`, count: 1},
            ]
        );
        
        // Long chat message in the middle causes a split 
        chat = [
            {name: 'player', tick: 0, message: 'Hi'},
            {name: 'player', tick: 0, message: 'Hey'},
            {name: 'player', tick: 0, message: makeLength('foo bar', 1024)},
            {name: 'player', tick: 0, message: 'Yo yo what is going on'},
        ];
        assert.deepStrictEqual(
            splitChat({chat}),
            [
                { content: `||${[chat[0], chat[1]].map(o => formatChatMessage(o)).join('')}||`, count: 2},
                { content: `||${formatChatMessage(chat[2])}||`, count: 1},
                { content: `||${[chat[3]].map(o => formatChatMessage(o)).join('')}||`, count: 1},
            ]
        );
        // Custom chunk size
        let extraLength = formatChatMessage({name: '2', tick: 0, message: ''}).length;
        chat = [
            {name: '2', tick: 0, message: makeLength('foo bar', 100 - extraLength)},
            {name: '2', tick: 0, message: makeLength('zoo bar', 100 - extraLength)},
            {name: '2', tick: 0, message: makeLength('bar bar', 100 - extraLength)},
        ];
        assert.deepStrictEqual(
            splitChat({chat}, {charsPerChunk: 100}),
            [
                { content: `||${[chat[0]].map(o => formatChatMessage(o)).join('')}||`, count: 1},
                { content: `||${[chat[1]].map(o => formatChatMessage(o)).join('')}||`, count: 1},
                { content: `||${[chat[2]].map(o => formatChatMessage(o)).join('')}||`, count: 1},
            ]
        );
        
        // test with noNewline
        extraLength = formatChatMessage({name: '2', tick: 0, message: ''}, {noNewline: true}).length;
        chat = [
            {name: '2', tick: 0, message: makeLength('foo bar', 100 - extraLength)},
            {name: '2', tick: 0, message: makeLength('zoo bar', 100 - extraLength)},
            {name: '2', tick: 0, message: makeLength('bar bar', 100 - extraLength)},
        ];
        assert.deepStrictEqual(
            splitChat({chat}, {charsPerChunk: 100}),
            [
                { content: `||${[chat[0]].map(o => formatChatMessage(o), {noNewline: true}).join('')}||`, count: 1},
                { content: `||${[chat[1]].map(o => formatChatMessage(o), {noNewline: true}).join('')}||`, count: 1},
                { content: `||${[chat[2]].map(o => formatChatMessage(o), {noNewline: true}).join('')}||`, count: 1},
            ]
        );
    });

    it ('formatPlayer', () => {
        // No emoji found
        assert.strictEqual(
            formatPlayer({name: 'Player', steam_id_str: '', faction: 'foo'}, {factionEmojis: {}}),
            'Player'
        );
        // Emoji found
        assert.strictEqual(
            formatPlayer({name: 'Player', steam_id_str: '', faction: 'foo'}, {factionEmojis: {'foo': '<emoji>'}}),
            '<emoji> Player'
        );
        // Link to leaderboards
        assert.strictEqual(
            formatPlayer({name: 'Player', steam_id_str: '123', faction: 'foo'}, {factionEmojis: {'foo': '<emoji>'}, leaderboardUrl: 'http://example.com/{steamId}'}),
            '<emoji> [Player](http://example.com/123)'
        );
        // Steam Id present multiple times in the url template
        assert.strictEqual(
            formatPlayer({name: 'Player', steam_id_str: '123', faction: 'foo'}, {factionEmojis: {'foo': '<emoji>'}, leaderboardUrl: 'http://example.com/{steamId}/{steamId}'}),
            '<emoji> [Player](http://example.com/123/123)'
        );
        assert.match(
            formatPlayer({name: 'Player', steam_id_str: '123', faction: 'foo'}, {factionEmojis: {'foo': '<emoji>'}}),
            new RegExp(`\\<emoji\\> \\[Player\\]\\(.*?123.*?\\)`)
        );
    });

    it('getPlayerListEmbed', () => {
        // No players
        assert.deepStrictEqual(
            getPlayerListEmbed({players: []}, 0, {factionEmojis: {}}), {
                name: 'Team 1',
                inline: true,
                value: '_No players available._'
            }
        );
        
        // With player
        assert.deepStrictEqual(
            getPlayerListEmbed({players: [{name: 'Player', faction: 'faction', team: 0, steam_id_str: '0'}]}, 0, {factionEmojis: {'faction': '<emoji>'}}), {
                name: 'Team 1',
                inline: true,
                value: '<emoji> Player'
            }
        );
        // With multiple players
        assert.deepStrictEqual(
            getPlayerListEmbed({players: [
                {name: 'P1', faction: 'faction', team: 0, steam_id_str: '0'},
                {name: 'P2', faction: 'faction', team: 0, steam_id_str: '0'},
            ]}, 0, {factionEmojis: {'faction': '<emoji>'}}), {
                name: 'Team 1',
                inline: true,
                value: '<emoji> P1\n<emoji> P2'
            }
        );
    });
});
