'use strict';

var config = require('config');
var _ = require('lodash');
var request = require('request');
var async = require('async');
var querystring = require('querystring');

var queue = async.queue(function(task, callback) {
  task(callback);
}, 1);

module.exports = {
  tokens: {
    xSecurityToken: null,
    cst: null
  },

  uris: {
    createSession: '/gateway/deal/session',
    getMarkets: '/gateway/deal/marketnavigation',
    getMarketNode: '/gateway/deal/marketnavigation',
    getCompanyNode: '/gateway/deal/marketnavigation',
    getApplications: '/gateway/deal/operations/application',
    getHistory: '/gateway/deal/prices'
  },

  requestInterval: 2000,
  requestCount: 0,

  createSession: function(params, callback) {
    if (arguments.length === 1) {
      callback = params;
    }

    params = _.extend({
      identifier: config.get('api.credentials.username'),
      password: config.get('api.credentials.password'),
      apiKey: config.get('api.credentials.key'),
      encryptedPassword: false
    }, params);

    this._makeRequest(this.uris.createSession, 'POST', params, callback);
  },

  getApplications: function(params, callback) {
    if (arguments.length === 1) {
      callback = params;
    }

    this._makeRequest(this.uris.getApplications, 'GET', this._getDefaultParams(params), callback);
  },

  getMarkets: function(params, callback) {
    if (arguments.length === 1) {
      callback = params;
    }

    this._makeRequest(this.uris.getMarkets, 'GET', this._getDefaultParams(params), callback);
  },

  getMarketIndex: function(params, callback) {
    params = this._getDefaultParams(params);

    var nodeId = params.nodeId;
    delete params.nodeId;

    this._makeRequest(this.uris.getMarketNode + '/' + nodeId, 'GET', params, callback);
  },

  getMarketSection: function(params, callback) {
    params = this._getDefaultParams(params);

    var nodeId = params.nodeId;
    delete params.nodeId;

    this._makeRequest(this.uris.getMarketNode + '/' + nodeId, 'GET', params, callback);
  },

  getCompany: function(params, callback) {
    params = this._getDefaultParams(params);

    var nodeId = params.nodeId;
    delete params.nodeId;

    this._makeRequest(this.uris.getCompanyNode + '/' + nodeId, 'GET', params, callback);
  },

  getAllCompanies: function(params, callback) {
    var self = this;

    async.waterfall([

      //get market index

      function(callback) {
        self.getMarketIndex(params, function(err, response, body) {
          if (err) {
            callback(err, null);
          }
          else {
            callback(null, body.nodes);
          }
        });
      },

      //get each marker index

      function(nodes, callback) {
        var out = [];

        _.each(nodes, function(index, i) {
          self.getMarketSection({nodeId: index.id}, function(err, response, body) {
            if (err) {
              callback(err, null);
            }
            else {
              _.each(body.nodes, function(company) {
                out.push(company);
              });

              if (i === nodes.length - 1) {
                callback(null, out);
              }
            }
          });
        });
      }
    ],
    function(err, out) {
      callback(err, out);
    });
  },

  getHistory: function(params, callback) {
    params = this._getDefaultParams(params);

    var epic = params.epic;
    delete params.epic;

    var resolution = params.resolution;
    delete params.resolution;

    var startDate = params.startDate;
    delete params.startDate;

    var endDate = params.endDate;
    delete params.endDate;

    this._makeRequest(this.uris.getHistory + '/' + epic + '/' + resolution + '?startdate=' + querystring.escape(startDate) + '&enddate=' + querystring.escape(endDate), 'GET', params, callback);
  },

  _getDefaultParams: function(overrides) {
    return _.extend({
      xSecurityToken: this.tokens.xSecurityToken,
      cst: this.tokens.cst,
      apiKey: config.get('api.credentials.key')
    }, overrides);
  },

  _makeRequest: function(uri, verb, params, callback) {
    var apiKey = params.apiKey;
    delete params.apiKey;

    var xSecurityToken = params.xSecurityToken;
    delete params.xSecurityToken;

    var cst = params.cst;
    delete params.cst;

    var opts = {
      url: config.get('api.url') + uri,
      method: verb,
      headers: {
        'X-IG-API-KEY': apiKey,
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8'
      }
    };

    if (_.keys(params).length > 0) {
      opts.body = JSON.stringify(params);
    }

    if (xSecurityToken !== undefined && cst !== undefined) {
      opts.headers['X-SECURITY-TOKEN'] = xSecurityToken;
      opts.headers['CST'] = cst;
    }

    var self = this;

    queue.push(function(queueCallback) {
      setTimeout(function() {
        self.requestCount++;

        request(opts, function(err, response, body) {
          if (!err && response !== undefined && response.statusCode === 200) {
            if (response.headers['x-security-token'] !== undefined) {
              self.tokens.xSecurityToken = response.headers['x-security-token'];
            }

            if (response.headers.cst !== undefined) {
              self.tokens.cst = response.headers.cst;
            }

            callback(null, response, JSON.parse(body));
          }
          else {
            callback(JSON.parse(body), null, null);
          }

          queueCallback();
        });
      }, self.requestInterval);
    });
  }
};
