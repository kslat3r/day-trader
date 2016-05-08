'use strict';

var assert = require('assert');
var should = require('should');
var igApi = require('../');

describe('igApi session', function() {
  it('must be able to create a session', function(done) {
    igApi.createSession(function(err, response, body) {
      if (err) {
        should.fail(err);
      }
      else {
        assert.equal(null, err);
        assert.equal(body.accountType, 'PHYSICAL');

        done();
      }
    });
  });
});
