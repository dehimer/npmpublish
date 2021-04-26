This is a testing stand for my case of usage.
Main case where you can need this library is when you have two or more packages that use one common package.
And that common package has injected imports that implemented by main package itself.
As example in common you has some import like:

export * from 'commonnpmpublish/text/.injected';

And text is for mobile placed in mobile/platform/text

So, we need replace commonnpmpublish by mobile/platform and remove .injected and get real path to implementation.
And published common package wiill has needed paths.

Also main package will get new dependency version.

Source code of publication script placed at ./scripts/publishMain directory

In this usage example:
- mobile is a main package 
- common is dependency of mobile
- web is another package that use common, but with it's own injected deps implementation

You cant run 
