#!/usr/bin/env node
'use strict';
var meow = require('meow');
var dataScraper = require('./');

var cli = meow({
  help: [
    'Usage',
    '  data-scraper',
    '',
    'Example',
    '  data-scraper'
  ].join('\n')
});

dataScraper(cli.input[0]);
