// const localPublisher = require('package-local-publisher');
const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");
const copydir = require('copy-dir');
const replaceInFile = require('replace-in-file');
const increaseVersion = require('../increaseVersion');
const { exec } = require('child_process');
// import {series} from 'async';

console.log('EAT BANANA, BE HAPPY');

const COMMON_PATH = '../common';
const COMMON_PREBUBLISH_PATH = '../common-prepublish';
const MOBILE_PATH = '../mobile';

console.log('__dirname');
console.log(__dirname);

(async () => {
    // do copy to temp folder
    copydir.sync(COMMON_PATH, COMMON_PREBUBLISH_PATH, {
        filter: function(stat, filepath, filename){
            if (stat === 'directory' && filepath.includes('node_modules')) {
                return false;
            }

            return true;  // remind to return a true value when file check passed.
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
        console.warn('Error happens on common publication');
        console.warn('Probably you are not logged in NPM account');
        console.warn('Use "npm login" command before next attempt to run');
        // remove temp folder
        rimraf(COMMON_PREBUBLISH_PATH, () => console.log(`Deleted ${COMMON_PREBUBLISH_PATH}`));
        return;
    }

    // remove temp folder
    rimraf(COMMON_PREBUBLISH_PATH, () => console.log(`Deleted ${COMMON_PREBUBLISH_PATH}`));

    // apply published version to real common package
    increaseVersion(COMMON_PATH, nextCommonVersion);

    // set new common version to mobile
    const mobilePackage = require(`../${MOBILE_PATH}/package.json`);
    mobilePackage.dependencies.commonnpmpublish = nextCommonVersion;
    fs.writeFileSync(`../${MOBILE_PATH}/package.json`, JSON.stringify(mobilePackage, null, 2));

    // increment mobile version
    increaseVersion(MOBILE_PATH);

    // publish mobile
    await new Promise((resolve, reject) => {
        exec('npm publish', {
            cwd: MOBILE_PATH
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                return;
            }
            resolve(stdout? stdout : stderr);
        });
    })
})();
