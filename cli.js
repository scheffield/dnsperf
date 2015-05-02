#!/usr/bin/env node
'use strict';
var meow = require('meow');
var dnsperf = require('./');

var cli = meow({
  help: [
    'Usage',
    '  dnsperf <input>',
    '',
    'Example',
    '  dnsperf Unicorn'
  ].join('\n')
});

dnsperf(cli.input[0]);
