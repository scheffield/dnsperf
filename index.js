'use strict';

var shell = require('shelljs');
var os = require('os');
var colors = require('colors');
var extend = require('extend');
var numbers = require('numbers');
var ProgressBar = require('progress');
var eventEmitter = new (require('events').EventEmitter)();
var Table = require('cli-table');

module.exports = function (str) {

  // -- const -----------------------------------------------------------------

  var SILENT = { silent: true };
  var LOOKUP_DEFAULT_OPT = {cacheReset: false, runs: 10};

  // -- conf ------------------------------------------------------------------

  var hosts = ['heise.de', 'netflix.com', 'google.com', 'google.com.au', 'facebook.com', 'youtube.com'];
  // TODO (scheffield): support meta info (dns provider name)
  var dnsServer = [
    {
      name: 'unblock-us 1',
      ip: '111.118.175.56'
    },{
      name: 'unblock-us 2',
      ip: '118.127.33.48'
    }, {
      name: 'unblock-us 3',
      ip: '208.122.23.23'
    }, {
      name: 'optus 1',
      ip: '211.29.132.12'
    }, {
      name: 'optus 2',
      ip: '198.142.0.51'
    }
  ];

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
    var normalizedOpt = extend({}, LOOKUP_DEFAULT_OPT, opt);
    var times = [];

    for (var i = 0; i < normalizedOpt.runs; i++) {
      times.push(mesureLookupTime(target, dns, normalizedOpt.cacheReset));
      eventEmitter.emit('tick');
    }

    // TODO (scheffield): reuse stats
    return {
      min: numbers.basic.min(times),
      avg: numbers.statistic.mean(times),
      max: numbers.basic.max(times),
      dev: numbers.statistic.standardDev(times),
      raw: times,
      target: target,
      dns: dns
    };
  }

  function benchmark(targets, dnss, opt) {
    var normalizedOpt = extend({}, LOOKUP_DEFAULT_OPT, opt);
    var lookupsTotal = targets.length * dnss.length * normalizedOpt.runs;
    var results = [];

    var bar = new ProgressBar('benchmarking [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 100,
      total: lookupsTotal
    });

    eventEmitter.on('tick', function() {
      bar.tick();
    });

    dnss.forEach(function(dns) {
      targets.forEach(function(target) {
        results.push(benchmarLookup(target, dns.ip, normalizedOpt));
      });
    });

    evaluateBenchmark(results);
  }

  // -- evaluation ------------------------------------------------------------

  // creates some statistics based on the benchmark
  function evaluateBenchmark(results) {
    evaluateAndPrint(results, 'dns', dnsToName);
    evaluateAndPrint(results, 'target');
  }

  function evaluateAndPrint(results, attribute, toName) {
    console.log('\nresult by ' + attribute + ': ');

    printTable(
      transformToRows(
        accumulateByAttribute(results, attribute), toName));
  }

  function accumulateByAttribute(results, attribute) {
    return results.reduce(function(res, currentResult) {
      res[currentResult[attribute]] = (res[currentResult[attribute]] || []).concat(currentResult.raw);
      return res;
    }, {});
  }

  function transformToRows(perAttributeRaw, transformNameFn) {
    return Object.keys(perAttributeRaw).map(function(dns) {
      var name = transformNameFn ? transformNameFn(dns) : dns;
      return {
        name: name,
        stat: stats(perAttributeRaw[dns])
      }
    });
  }

  function printTable(perAttribute) {
    var table = new Table({
      head: ['', 'min', 'avg', 'max', 'stdDev'],
      chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
             , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
             , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
             , 'right': '' , 'right-mid': '' , 'middle': ' ' },
      style: { 'padding-left': 0, 'padding-right': 0 }
    });

    perAttribute.forEach(function(result) {
      table.push([result.name, result.stat.min, result.stat.avg, result.stat.max, result.stat.dev]);
    });

    console.log(table.toString());
  }

  // creates some simple stats for an array of numbers
  function stats(raw) {
    return {
      min: Math.round(numbers.basic.min(raw)),
      avg: Math.round(numbers.statistic.mean(raw)),
      max: Math.round(numbers.basic.max(raw)),
      dev: Math.round(numbers.statistic.standardDev(raw)),
    };
  }

  function dnsToName(dns) {
    var name;
    dnsServer.some(function(server) {
      if (server.ip === dns) {
        name = server.name;
        return true;
      }
    });

    return name;
  }

  // -- main ------------------------------------------------------------------

  var osInfo = collectOSInfo();

  if (!osInfo.osx) {
    console.log('At the moment only OSX is supported!'.red);
    return;
  }

  // TODO (scheffield): check for cli apps

  // TODO (scheffield): check for sudo

  benchmark(hosts, dnsServer, {runs: 30});
};
