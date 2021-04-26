const fs = require('fs');
const { exec } = require('child_process');
const yargs = require('yargs');

const increaseVersion = require('./increaseVersion');
const publishDependency = require('./publishDependency');

const MAIN_PATH = '../mobile';
const DEPENDENCY_PATH = '../common';
const DEPENDENCY_NAME = 'commonnpmpublish';

(async () => {
    const argv = yargs.argv;

    const mainPath = MAIN_PATH || argv.mainPath;
    const depPath = DEPENDENCY_PATH || argv.depPath;
    const depName = DEPENDENCY_NAME || argv.depName;

    console.log('argv');
    console.log(argv);
    const nextCommonVersion = publishDependency({
        depPath: DEPENDENCY_PATH,
    })

    if (!nextCommonVersion) {
        return;
    }

    // set new common version to mobile
    const mobilePackage = require(`../${MAIN_PATH}/package.json`);
    mobilePackage.dependencies[DEPENDENCY_NAME] = nextCommonVersion;
    fs.writeFileSync(`../${MAIN_PATH}/package.json`, JSON.stringify(mobilePackage, null, 2));

    // increment mobile version
    increaseVersion(MAIN_PATH);

    // publish mobile
    await new Promise((resolve, reject) => {
        exec('npm publish', {
            cwd: MAIN_PATH
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                return;
            }
            resolve(stdout? stdout : stderr);
        });
    })
})();
