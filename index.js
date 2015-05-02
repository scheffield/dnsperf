'use strict';

var shell = require('shelljs');
var os = require('os');
var colors = require('colors');

module.exports = function (str) {

  var SILENT = { silent: true };

  function collectOSInfo() {
    if (os.platform().toLowerCase() === 'darwin') {
      var version = shell.exec('sw_vers -productVersion', SILENT).output.trim();
      var versionA = version.split('.');

      return {
        osx: true,
        version: version,
        major: versionA[0],
        minor: versionA[1],
        patch: versionA[2]
      };
    }

    return {osx: false};
  }

  function dig(target, dns) {
    return shell.exec(['dig @', dns, ' ', target, ' | grep "Query time:"'].join(''), SILENT);
  }

  // @returns ms to perform the lookup
  // TODO (scheffield): explain mesurement: http://blog.easydns.org/2011/05/02/dns-speeds-debunked/
  function mesureLookupTime(target, dns) {
    var output = dig(target, dns).output.trim();

    return parseInt(/;; Query time: ([0-9]+) msec/.exec(output)[1], 10);
  }

  var osInfo = collectOSInfo();
  console.log(osInfo);

  if (!osInfo.osx) {
    console.log('At the moment only OSX is supported!'.red);
    return;
  }

  //TODO (scheffield): check for cli apps

  for (var i = 0; i < 10; i++) {
    //TODO (scheffield): consider return code
    console.log(mesureLookupTime('heise.de', '8.8.8.8'));
  }


};
