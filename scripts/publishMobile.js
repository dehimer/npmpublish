// const localPublisher = require('package-local-publisher');
const path = require('path');
const copydir = require('copy-dir');
const replaceInFile = require('replace-in-file');
// const { exec } = require('child_process');
// const increaseVersion = require('./increaseVersion');
// import {series} from 'async';

console.log('EAT BANANA, BE HAPPY');

(async () => {
    // do copy to temp folder
    copydir.sync('../common', '../common-prepublish', {
        filter: function(stat, filepath, filename){
            if (stat === 'directory' && filepath.includes('node_modules')) {
                return false;
            }

            return true;  // remind to return a true value when file check passed.
        }
    });

    // replace alias strings
    const results = replaceInFile.sync({
        files: '../common-prepublish/**',
        from: /\/common\/.+\/.injected/g,
        to: (match) => {
            return match.replace('/common/', '/mobile/platform/').replace('.injected', '');
        },
        countMatches: true
    });

    console.log(results);

    // increment version in temp folder
    // publish from temp folder
    // remove temp folder
    // apply published version to real common package

    // set new common version to mobile
    // increment mobile version
    // publish mobile

    // localPublisher
    // await exec('node ../scripts/node_modules/package-local-publisher -s ../common -d ../common-prepublish', (error, stdout) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log(stdout);
    //     }
    // });
    // await exec('node ../scripts/node_modules/local-package-publisher -p', {
    //     cwd: '../common'
    // }, (error, stdout) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log(stdout);
    //     }
    // });
})();

// increaseVersion('../mobile');
// increaseVersion('../common');
// import {series} from 'async';


// series([
//     () => exec('npm run dev'),
//     () => exec('npm run test')
// ]);
