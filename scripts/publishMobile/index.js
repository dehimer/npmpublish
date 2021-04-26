const fs = require('fs');
const { exec } = require('child_process');

const increaseVersion = require('./increaseVersion');
const publishCommon = require('./publishCommon');

console.log('EAT BANANA, BE HAPPY');

const COMMON_PATH = '../common';
const COMMON_PREBUBLISH_PATH = '../common-prepublish';
const MOBILE_PATH = '../mobile';

(async () => {
    const nextCommonVersion = publishCommon({
        commonPath: COMMON_PATH,
        commonPrepublishPath: COMMON_PREBUBLISH_PATH
    })

    if (!nextCommonVersion) {
        return;
    }

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
