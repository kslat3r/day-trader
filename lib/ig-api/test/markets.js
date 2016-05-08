'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var igApi = require('../');

describe('igApi markets', function() {
  beforeEach(function(done) {
    igApi.createSession(function(err) {
      if (err) {
        should.fail(err);
      }
      else {
        done();
      }
    });
  });

  it('must be able to retrieve all markets', function(done) {
    igApi.getMarkets(function(err, response, body) {
      if (err) {
        should.fail(err);
      }
      else {
        assert.equal(typeof(body.nodes), 'object');
        assert.notEqual(body.nodes.length, 0);

        var names = [];

        _.forEach(body.nodes, function(node) {
          names.push(node.name);
        });

        assert.notStrictEqual(names.indexOf('Shares - LSE (UK)'), -1);

        done();
      }
    });
  });
});
