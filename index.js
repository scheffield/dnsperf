'use strict';

var shell = require('shelljs');
var os = require('os');


module.exports = function (str) {
  console.log(str || 'Rainbow');

  console.log(shell.exec('node --version', { silent: true }).output);
  console.log(('type, platform, arch, release').split(', ').map(function(cmd) {
    return [cmd, os[cmd]()].join(': ');
  }));

};
