'use strict';

var shell = require('shelljs');
var os = require('os');
var colors = require('colors');
var extend = require('extend');
var numbers = require('numbers');

module.exports = function (str) {

  // -- const -----------------------------------------------------------------

  var SILENT = { silent: true };

  // -- conf ------------------------------------------------------------------

  var hosts = ['heise.de', 'netflix.com'];
  // TODO (scheffield): support meta info (dns provider name)
  var dnsServer = ['111.118.175.56', '118.127.33.48', '208.122.23.23', '211.29.132.12', '198.142.0.51'];

  // -- os --------------------------------------------------------------------

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

  // -- dns -------------------------------------------------------------------

  // http://coolestguidesontheplanet.com/clear-the-local-dns-cache-in-osx/
  // TODO (scheffield): take os info into account
  function resetDNSCache() {
    return shell.exec('sudo discoveryutil udnsflushcaches', SILENT).code === 0;
  }

  // TODO (scheffield): consider return code
  function dig(target, dns) {
    return shell.exec(['dig @', dns, ' ', target, ' | grep "Query time:"'].join(''), SILENT);
  }

  // @returns ms to perform the lookup
  // TODO (scheffield): explain mesurement: http://blog.easydns.org/2011/05/02/dns-speeds-debunked/
  function mesureLookupTime(target, dns, cacheReset) {
    var output;

    if (cacheReset) {
      resetDNSCache();
    }

    output = dig(target, dns).output.trim();

    return parseInt(/;; Query time: ([0-9]+) msec/.exec(output)[1], 10);
  }

  // -- benchmark -------------------------------------------------------------

  // Benchmarks one particular lookup
  function benchmarLookup(target, dns, opt) {
    var normalizedOpt = extend({}, {cacheReset: false, runs: 10}, opt);
    var times = [];

    for (var i = 0; i < normalizedOpt.runs; i++) {
      times.push(mesureLookupTime(target, dns, normalizedOpt.cacheReset));
    }

    return {
      min: numbers.basic.min(times),
      avg: numbers.statistic.mean(times),
      max: numbers.basic.max(times),
      dev: numbers.statistic.standardDev(times)
    };
  }

  // -- main ------------------------------------------------------------------

  var osInfo = collectOSInfo();
  console.log(osInfo);

  if (!osInfo.osx) {
    console.log('At the moment only OSX is supported!'.red);
    return;
  }

  // TODO (scheffield): check for cli apps

  // TODO (scheffield): check for sudo

  console.log(benchmarLookup('netflix.com', '8.8.8.8'));

};
