const fs = require('fs');
const semver = require('semver');
const path = require('path');

module.exports = (packagePath, forcedVersion) => {
  console.log('__dirname');
  console.log(__dirname);
  const packageJsonPath = path.resolve(packagePath, 'package.json');
  console.log(`Increase version in ${packageJsonPath}`);

  if (fs.existsSync(packageJsonPath)) {
    const package = require(packageJsonPath);

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

    const newVersion = forcedVersion || semver.inc(package.version, type);
    console.log(`newVersion: ${newVersion}`);
    if (semver.valid(newVersion)) {
      package.version = newVersion;
      fs.writeFileSync(packageJsonPath, JSON.stringify(package, null, 2));

      console.log('Version updated', currentVersion, '=>', newVersion);

      return newVersion;
    } else {
      console.error('Version Incorrect')
      return null;
    }
  } else {
    console.error(`Not found: ${packageJsonPath}`);
    return null;
  }
}
