'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var igApi = require('../');

describe('igApi market index', function() {
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

  it('must be able to retrieve the LSE market index', function(done) {
    igApi.getMarkets(function(err, response, body) {
      if (err) {
        should.fail(err);
      }
      else {
        var id = null;

        _.forEach(body.nodes, function(node) {
          if (node.name === 'Shares - LSE (UK)') {
            id = node.id;
          }
        });

        assert.notStrictEqual(id, null);

        igApi.getMarketIndex({nodeId: id}, function(err, response, body) {
          if (err) {
            should.fail(err);
          }
          else {
            assert.notEqual(typeof(body.nodes), 'undefined');
            assert.notEqual(body.nodes.length, 0);

            assert.equal(body.nodes.length > 26, true);

            done();
          }
        });
      }
    });
  });
});
