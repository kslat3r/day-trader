#!/usr/bin/env node
'use strict';
var meow = require('meow');
var classificationModel = require('./');

var cli = meow({
  help: [
    'Usage',
    '  classification-model <input>',
    '',
    'Example',
    '  classification-model Unicorn'
  ].join('\n')
});

classificationModel(cli.input[0]);
