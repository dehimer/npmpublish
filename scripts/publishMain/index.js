const fs = require('fs');
const { exec } = require('child_process');

const increaseVersion = require('./increaseVersion');
const publishDependency = require('./publishDependency');

console.log('EAT BANANA, BE HAPPY');

const COMMON_PATH = '../common';
const MOBILE_PATH = '../mobile';
const COMMON_NPMPUBLISH = 'commonnpmpublish';

// commonPath
// mobilePath
// commonPacketName

(async () => {
    const nextCommonVersion = publishDependency({
        commonPath: COMMON_PATH,
    })

    if (!nextCommonVersion) {
        return;
    }

    // set new common version to mobile
    const mobilePackage = require(`../${MOBILE_PATH}/package.json`);
    mobilePackage.dependencies[COMMON_NPMPUBLISH] = nextCommonVersion;
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
