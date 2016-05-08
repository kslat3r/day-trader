'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var igApi = require('../');

describe('igApi market section', function() {
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

  it('must be able to retrieve all the LSE market stocks from a section', function(done) {
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
            igApi.getMarketSection({nodeId: body.nodes[0].id}, function(err, response, body) {
              if (err) {
                should.fail(err);
              }
              else {
                assert.notEqual(typeof(body.nodes), 'undefined');
                assert.notEqual(body.nodes.length, 0);

                assert.equal(body.nodes[0].name.substr(0, 1).toLowerCase(), 'a');
                assert.equal(body.nodes[body.nodes.length - 1].name.substr(0, 1).toLowerCase(), 'a');

                done();
              }
            });
          }
        });
      }
    });
  });
});
