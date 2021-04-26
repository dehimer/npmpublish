const fs = require('fs');
const path = require('path');
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

    const nextDepVersion = await publishDependency({
        mainPath: mainPath,
        depPath: depPath,
        depName: depName,
        depVersion: forcedDependencyVersion
    })

    if (!nextDepVersion) {
        return;
    }

    console.log('nextDepVersion:');
    console.log(nextDepVersion);

    // set new common version to mobile
    const absoluteMainPath = path.resolve(__dirname, '../../', mainPath);
    const mainPackagePath = path.resolve(absoluteMainPath, `package.json`);
    console.log(`Increase ${depName} version to ${nextDepVersion} in ${mainPackagePath}`);
    const mainPackage = require(mainPackagePath);
    mainPackage.dependencies[depName] = nextDepVersion;
    fs.writeFileSync(mainPackagePath, JSON.stringify(mainPackage, null, 2));

    // increment mobile version
    increaseVersion(absoluteMainPath, forcedMainVersion);

    // publish mobile
    await new Promise((resolve, reject) => {
        exec('npm publish', {
            cwd: absoluteMainPath
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                return;
            }
            resolve(stdout? stdout : stderr);
        });
    })
};
