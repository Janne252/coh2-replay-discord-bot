import assert from 'assert';
import {describe, it} from 'mocha';
import { ReplayParser } from '.';
import fs from 'fs-extra';
import path from 'path';

function massTestDir(root: string) {
    console.log(`Beginning to check replays in ${root}...`);
    massTest(fs.readdirSync(root).map(file => path.join(root, file)));
}
function massTest(files: string[]) {
    console.log(`Beginning to check ${files.length} replays...`);
    let count = 0;
    let skippedInvalidVersion = 0;
    let skippedEmptyFile = 0;
    let skippedInvalidMagic = 0;
    let skippedOtherwiseInvalid = 0;
    let success = 0;
    let failed = 0;
    for (const filename of files) {
        try {
            const replay = new ReplayParser(filename, {strict: false});
            if (!replay.isValid) {
                if (replay.version < ReplayParser.MinimumVersion) {
                    skippedInvalidVersion++;
                } else if (replay.magic !== ReplayParser.Magic) {
                    skippedInvalidMagic++;
                } else if (replay.dataLength === 0) {
                    skippedEmptyFile++;
                } else {
                    var b = 1;
                    skippedOtherwiseInvalid++;
                }
            } else {
                success++;
            }
            
        } catch (error) {
            console.error(error);
            console.log(filename);
            failed++;
            var b = 1;
        } finally {
            count++;
        }
    }
    console.info(
        `Parsed ${count} replays of which ${success} succeeded.` +
        `\n\tSkipped:` +
        `\n\t\t${skippedInvalidVersion} (invalid version)` +
        `\n\t\t${skippedEmptyFile} (empty file)` +
        `\n\t\t${skippedInvalidMagic} (invalid magic)` +
        `\n\t\t${skippedOtherwiseInvalid} (other)` +
        `\n\t\t${failed} (FAILED)`
    );
}
describe('contrib.coh2.replay-parser', () => {
    /*
    it('header', () => {
        const replay = new ReplayParser(path.join(__dirname, 'tests/kimbo_vs_hans_g4.rec'));
        assert.strictEqual(replay.version, 23468);
        assert.strictEqual(replay.magic, 'COH2_REC');
        assert.strictEqual(replay.timestamp, '29/08/2020 20:33');
    });
    it('no_mod_fixed_high_annih', () => {
        const replay = new ReplayParser(path.join(__dirname, 'tests/no_mod_fixed_high_annih.rec'));
        assert.strictEqual(replay.version, 23468);
    });
    it('no_mod_fixed_standard_annih', () => {
        const replay = new ReplayParser(path.join(__dirname, 'tests/no_mod_fixed_standard_annih.rec'));
        assert.strictEqual(replay.version, 23468);
    });
    it('no_mod_fixed_standard_annih_custom', () => {
        const replay = new ReplayParser(path.join(__dirname, 'tests/no_mod_fixed_standard_annih_custom.rec'));
        assert.strictEqual(replay.version, 23468);
    });
    */
    /*
    it('specific-files 1', () => {
        for (const filename of [
            "E:\\dev\\coh2-replay-discord-bot\\src\\contrib\\coh2\\replay-parser\\tests\\no_mod_fixed_high_annih.rec",
            "E:\\dev\\coh2-replay-discord-bot\\src\\contrib\\coh2\\replay-parser\\tests\\no_mod_fixed_standard_annih.rec",
        ]) {
            const replay = new ReplayParser(filename);
        }
    });
    */
   /*
    it('specific-files 2', () => {
        for (const filename of [
            // .info music
            'C:\\Users\\Janne\\Downloads\\sample-replays\\101292.eindhovenmeatgrinder.rec',

            // .options atmospheres
            'C:\\Users\\Janne\\Downloads\\sample-replays\\101523.gross-slog.rec',

            // .options scenario_description_ext
            'C:\\Users\\Janne\\Downloads\\sample-replays\\106519.temp-campaign.rec',

            // 1 default skin of 0 length
            'C:\\Users\\Janne\\Downloads\\sample-replays\\106468.steppes-hold-stars.rec',

            // 0 default skins
            'C:\\Users\\Janne\\Downloads\\sample-replays\\100207.pershingvskt.rec',
            
            // .sceneref (full path, name, folder path)
            'C:\\Users\\Janne\\Downloads\\sample-replays-02\\88007.prilaz-moskvi.rec',
        ]) {
            const replay = new ReplayParser(filename);
        }
    });
    */
    if (false) 
        it('coh2-org-2020-10-04', () => {
            massTestDir(path.join(process.cwd(), 'large-replay-sample-sets/coh2-org-2020-10-04'));
        });
    if (false) 
        it('mass-test 01', () => {
            massTestDir(`C:\\Users\\Janne\\Downloads\\sample-replays`);
        });
    if (false) 
        it('mass-test 02', () => {
            massTestDir(`C:\\Users\\Janne\\Downloads\\sample-replays-02`);
        });
    if (false) 
        it('battlefront', () => {
            massTestDir(path.join(process.cwd(), 'tests/battlefront-replays'));
        });


    if (false) {
        it('coh2-org-2020-10-04-full', () => {
            massTestDir(path.join(process.cwd(), '../large-replay-sample-sets/coh2-org-2020-10-04-full'));
        });
    }
    if (true) {
        it('coh2-org-2020-10-04-reduced', () => {
            massTestDir(path.join(process.cwd(), '../large-replay-sample-sets/coh2-org-2020-10-04-reduced'));
        });
    }
    if (false) {
        it('special-replays', () => {
            massTest([
                'tests/special-replays/player-inventory-item-kind-514.rec',
                // 'tests/special-replays/scenario-with-0-default-skins.rec',
                // 'tests/special-replays/scenario-with-atmosphere-options.rec',
                // 'tests/special-replays/scenario-with-default-skin-0-length.rec',
                // 'tests/special-replays/scenario-with-music.rec',
                // 'tests/special-replays/scenario-with-scenario-description-ext.rec',
                // 'tests/special-replays/scenario-with-sceneref.rec',
            ].map(filename => path.join(process.cwd(), filename)));
        });
    }

    if (false) {
        it('game-configurations', () => {
            massTest([
                'tests/game-configuration-replays/starting_positions_random.rec',
                //'tests/game-configuration-replays/starting_positions_fixed.rec',
                // 'tests/game-configuration-replays/starting_positions_fixed_try_2.rec',
                // 'tests/game-configuration-replays/starting_positions_fixed_reversed.rec',

                // 'tests/game-configuration-replays/starting_resources_standard.rec',
                // 'tests/game-configuration-replays/starting_resources_high.rec',
                // 
                // 'tests/game-configuration-replays/victory_point_500.rec',
                // 
                // 'tests/game-configuration-replays/cold_tech_scenario_default.rec',
                // 'tests/game-configuration-replays/cold_tech_disabled.rec',
                // 'tests/game-configuration-replays/victory_point_250.rec',
                // 'tests/game-configuration-replays/victory_point_1000.rec',
                // 'tests/game-configuration-replays/default_annihilation.rec',
                // 'tests/game-configuration-replays/default_tuning_pack_all_units.rec',
                // 'tests/game-configuration-replays/default_win_condition_ccm2_annihilation.rec',

            ].map(filename => path.join(process.cwd(), filename)));
        });
    }

});
