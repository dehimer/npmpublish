NPM PUBLISH package needed to replace standard npm publish command with autoreplace of injected aliases

It's extends base functionality by nex features:
- publishing dependency package that placed near to current package
- autoincrement version dependency version
- find and replace [depPath]/[pathToReplace]/.injected path to main [mainPath]/platform 
- publishing dependency to npm
- increment dependency version in main package
- increment main package version
- publishing next main package version on npm

Usage:

in package.json of main package you need to add next command to scripts:

"publishNext": "node ../scripts/publishMain/index.js --mainPath=../mobile --depPath=../common --depName=commonnpmpublish"

then you can run it by command:

npm run publishNext -- --mainVersion=1.1.1 --depVersion=0.0.2

There several arguments:
- mainPath - path to main package itself
- depPath - path to dependency package
- depName - name of dependency on npm (needed to update version of dependencies of main package)
- mainVersion - forced version of main package for cases when you do not know is it free next version
- depVersion - forced version of dependency package for cases when you do not know is it free next version
