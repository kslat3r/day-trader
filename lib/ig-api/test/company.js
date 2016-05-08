'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var igApi = require('../');

describe('igApi company', function() {
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

  it('must be able to retrieve company stock information', function(done) {
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
                igApi.getCompany({nodeId: body.nodes[0].id}, function(err, response, body) {
                  if (err) {
                    should.fail(err);
                  }
                  else {
                    assert.equal(body.nodes, null);
                    assert.equal(body.markets.length === 1, true);

                    assert.equal(body.markets[0].instrumentType, 'SHARES');
                    assert.equal(body.markets[0].instrumentName, 'AA PLC');

                    done();
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});
