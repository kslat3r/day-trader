'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var igApi = require('../');

describe('igApi companies', function() {
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

  it('must be able to retrieve all company stock information', function(done) {
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

        igApi.getAllCompanies({nodeId: id}, function(err, companies) {
          if (err) {
            should.fail(err);
          }
          else {
            assert.equal(companies[0].id, '469009');
            assert.equal(companies[0].name, 'AA PLC');

            assert.equal(companies[companies.length - 1].id, '340209');
            assert.equal(companies[companies.length - 1].name, 'Zytronic PLC');

            assert.equal(companies.length > 1600, true);

            done();
          }
        });
      }
    });
  });
});
