console.log('EAT BANANA');
const fs = require('fs');
const semver = require('semver');
const path = require('path');

module.exports = (packagePath) => {
  const packageJsonPath = path.resolve(packagePath, 'package.json');
  console.log(`Increase version in ${packageJsonPath}`);

  if (fs.existsSync(packageJsonPath)) {
    const package = require('../package.json');

    const currentVersion = package.version;
    console.log(`currentVersion: ${currentVersion}`);
    const prerelease = semver.prerelease(package.version);
    console.log(`prerelease: ${prerelease}`);
    let type = process.argv[2];
    console.log(`version type: ${type}`);

    if (prerelease) {
      type = 'prerelease';
    } else if (!['major', 'minor', 'patch'].includes(type)) {
      type = 'patch';
    }

    console.log(`inc type: ${type}`);

    const newVersion = semver.inc(package.version, type);
    console.log(`newVersion: ${newVersion}`);
    if (semver.valid(newVersion)) {
      package.version = newVersion;
      fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));

      console.log('Version updated', currentVersion, '=>', newVersion);
    } else {
      console.error('Version Incorrect')
    }
  } else {
    console.error(`Not found: ${packageJsonPath}`);
  }
}
