const { exec } = require('child_process');
const rimraf = require("rimraf");
const copydir = require('copy-dir');
const replaceInFile = require('replace-in-file');

const increaseVersion = require('./increaseVersion');

const COMMON_PREBUBLISH_PATH = '../common-prepublish';

const removeTempDirectory = (dirPath) => rimraf(dirPath, () => console.log(`Deleted ${dirPath}`))

module.exports = async ({
    commonPath
}) => {
    // do copy to temp folder
    copydir.sync(commonPath, COMMON_PREBUBLISH_PATH, {
        filter: function(stat, filepath){
            if (stat === 'directory' && filepath.includes('node_modules')) {
                return false;
            }

            return true;
        }
    });

    // increment version in temp folder
    const nextCommonVersion = increaseVersion(COMMON_PREBUBLISH_PATH);
    console.log('nextCommonVersion:');
    console.log(nextCommonVersion);

    // replace alias strings
    const results = replaceInFile.sync({
        files: `${COMMON_PREBUBLISH_PATH}/**`,
        from: /\/common\/.+\/.injected/g,
        to: (match) => {
            return match.replace('/common/', '/mobile/platform/').replace('.injected', '');
        },
        countMatches: true
    });

    console.log(`Replaced aliases in ${results.length} files`);

    // publish from temp folder
    try {
        await new Promise((resolve, reject) => {
            exec('npm publish', {
                cwd: COMMON_PREBUBLISH_PATH
            }, (error, stdout, stderr) => {
                if (error) {
                    console.warn(error);
                    reject(error);
                    return;
                }
                resolve(stdout? stdout : stderr);
            });
        });
    } catch (e) {
        console.error(e);
        console.warn('Error happens on common publication');
        console.warn('Probably you are not logged in NPM account');
        console.warn('Use "npm login" command before next attempt to run');
        console.warn('Another case - you run it through yarn. Use "npm run" instead.');

        // remove temp folder
        removeTempDirectory(COMMON_PREBUBLISH_PATH);
        return null;
    }

    // remove temp folder
    removeTempDirectory(COMMON_PREBUBLISH_PATH);

    // apply published version to real common package
    increaseVersion(commonPath, nextCommonVersion);

    return nextCommonVersion;
}
