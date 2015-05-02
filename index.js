'use strict';

var shell = require('shelljs');
var os = require('os');
var colors = require('colors');

module.exports = function (str) {

  function collectOSInfo() {
    if (os.platform().toLowerCase() === 'darwin') {
      var version = shell.exec('sw_vers -productVersion', { silent: true }).output.trim();
      var versionA = version.split('.');

      return {
        osx: false,
        version: version,
        major: versionA[0],
        minor: versionA[1],
        patch: versionA[2]
      };
    }

    return {osx: false};
  };

  var osInfo = collectOSInfo();
  console.log(osInfo);

  if (!osInfo.osx) {
    console.log('At the moment only OSX is supported!'.red);
    return;
  }

};
