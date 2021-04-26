const fs = require('fs');
const path = require('fs');
const { exec } = require('child_process');
const yargs = require('yargs');

const increaseVersion = require('./increaseVersion');
const publishDependency = require('./publishDependency');

const MAIN_PATH = '../mobile';
const DEPENDENCY_PATH = '../common';
const DEPENDENCY_NAME = 'commonnpmpublish';

module.exports = async () => {
    const argv = yargs.argv;

    const mainPath = argv.mainPath || MAIN_PATH;
    const depPath = argv.depPath || DEPENDENCY_PATH;
    const depName = argv.depName || DEPENDENCY_NAME;
    const forcedMainVersion = typeof argv.mainVersion === 'string' ? argv.mainVersion : null;
    const forcedDependencyVersion = typeof argv.depVersion === 'string' ? argv.depVersion : null;

    console.log('argv');
    console.log(argv);
    console.log(`forcedMainVersion: ${forcedMainVersion}`);
    console.log(`forcedDependencyVersion: ${forcedDependencyVersion}`);

    const nextCommonVersion = publishDependency({
        mainPath: mainPath,
        depPath: depPath,
        depName: depName,
        depVersion: forcedDependencyVersion
    })

    if (!nextCommonVersion) {
        return;
    }

    // set new common version to mobile
    const mobilePackagePath = path.resolve('../', mainPath, `package.json`);
    const mobilePackage = require(mobilePackagePath);
    mobilePackage.dependencies[depName] = nextCommonVersion;
    fs.writeFileSync(mobilePackagePath, JSON.stringify(mobilePackage, null, 2));

    // increment mobile version
    increaseVersion(mainPath, forcedMainVersion);

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
};
