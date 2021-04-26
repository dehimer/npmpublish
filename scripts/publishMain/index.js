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
        mainPath: mainPath,
        depPath: depPath,
        depName: depName
    })

    if (!nextCommonVersion) {
        return;
    }

    // set new common version to mobile
    const mobilePackage = require(`../${mainPath}/package.json`);
    mobilePackage.dependencies[depName] = nextCommonVersion;
    fs.writeFileSync(`../${mainPath}/package.json`, JSON.stringify(mobilePackage, null, 2));

    // increment mobile version
    increaseVersion(mainPath);

    // publish mobile
    await new Promise((resolve, reject) => {
        exec('npm publish', {
            cwd: mainPath
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                return;
            }
            resolve(stdout? stdout : stderr);
        });
    })
})();
