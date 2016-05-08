'use strict';

var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var moment = require('moment');
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
                igApi.getCompany({nodeId: body.nodes[10].id}, function(err, response, company) {
                  if (err) {
                    should.fail(err);
                  }
                  else {
                    igApi.getHistory({
                      epic: company.markets[0].epic,
                      resolution: 'DAY',
                      startDate: moment((new Date().getTime()) - (60*60*24*7*1000)).format('YYYY:MM:DD-HH:mm:ss'),
                      endDate: moment((new Date().getTime())).format('YYYY:MM:DD-HH:mm:ss')
                    }, function(err, response, body) {
                      if (err) {
                        should.fail(err);
                      }
                      else {
                        console.log(body);

                        done();
                      }
                    });
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
