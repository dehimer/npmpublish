const { exec } = require('child_process');
const rimraf = require('rimraf');
const copydir = require('copy-dir');
const replaceInFile = require('replace-in-file');

const increaseVersion = require('./increaseVersion');

const PREBUBLISH_PATH = '../common-prepublish';

const removeTempDirectory = (dirPath) => rimraf(dirPath, () => console.log(`Deleted ${dirPath}`))

module.exports = async ({
    mainPath,
    depPath,
    depName,
    depVersion
}) => {
    // do copy to temp folder
    copydir.sync(depPath, PREBUBLISH_PATH, {
        filter: function(stat, filepath){
            if (stat === 'directory' && filepath.includes('node_modules')) {
                return false;
            }

            return true;
        }
    });

    // increment version in temp folder
    const nextDepVersion = increaseVersion(PREBUBLISH_PATH, depVersion);
    console.log('nextDepVersion:');
    console.log(nextDepVersion);

    // replace alias strings
    const regexp = new RegExp(`${depName}\/.+\\/.injected`, 'g');
    const results = replaceInFile.sync({
        files: `${PREBUBLISH_PATH}/**`,
        from: regexp,
        to: (match) => {
            console.log('match');
            console.log(match);
            return match.replace(depName, `${mainPath}/platform`).replace('.injected', '');
        },
        countMatches: true
    });
    console.log(`Replaced aliases for ${depName} in ${results.filter(({ hasChanged }) => hasChanged).length} files`);
    console.log(results.filter(({ hasChanged }) => hasChanged));

    // publish from temp folder
    try {
        await new Promise((resolve, reject) => {
            exec('npm publish', {
                cwd: PREBUBLISH_PATH
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
        removeTempDirectory(PREBUBLISH_PATH);
        return null;
    }

    // remove temp folder
    removeTempDirectory(PREBUBLISH_PATH);

    // apply published version to real common package
    increaseVersion(depPath, nextDepVersion);

    return nextDepVersion;
}
