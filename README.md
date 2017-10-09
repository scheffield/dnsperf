#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Benchmarking dns server

Prints a list like:

```sh
result by dns:
             min avg max stdDev
unblock-us 1 25  76  756 74
unblock-us 2 26  38  231 24
unblock-us 3 183 210 589 52
optus 1      25  38  422 36
optus 2      36  58  338 41

result by target:
              min avg max stdDev
heise.de      25  81  589 85
netflix.com   26  81  422 73
google.com    25  74  243 66
google.com.au 26  94  756 103
facebook.com  25  90  448 82
youtube.com   26  85  265 68
```

## Install & Usage

```sh
$ git clone https://github.com/scheffield/dnsperf.git
$ cd dnsperf
$ node cli.js
```
## Todo

* Configurable list of DNS server
* Configurable list of names to resolve (aka targets)
* Error handling
* Support for cli params instead of hardcoded values

## License

MIT © [Max Scheffler](digitalme.co)


[npm-image]: https://badge.fury.io/js/dnsperf.svg
[npm-url]: https://npmjs.org/package/dnsperf
[travis-image]: https://travis-ci.org/scheffield/dnsperf.svg?branch=master
[travis-url]: https://travis-ci.org/scheffield/dnsperf
[daviddm-image]: https://david-dm.org/scheffield/dnsperf.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/scheffield/dnsperf
