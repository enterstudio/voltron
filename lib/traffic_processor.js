var gauss = require('gauss');
var Vector = gauss.Vector;
var Collection = gauss.Collection;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');

var Processor = module.exports = function(data) {
  EventEmitter.call(this);  
  this.events = new Collection(data.filter(function(d) {return d.event === 'data';}));
  this.errs = new Collection(data.filter(function(d) {return d.event === 'err';}));

};
util.inherits(Processor, EventEmitter);

Processor.prototype.start = function(cb) {
  var self = this;
  async.parallel([function(callback) {self._totalAverage(callback);}, function(callback) {self._averagePerCode(callback); }, function(callback){ self._averagePerPath(callback); }, function(callback) { self._processErrors(callback) }], 
    function(err, results) {
      var data = [];
      results.forEach(function(d) {
        if(Array.isArray(d)) {
          data = data.concat(d);
        } else {
          data.push(d);  
        }  
      });  
      cb(data);
    });
};

Processor.prototype._totalAverage = function(cb) {
  var avg = this.events
    .map(function(ev) { return ev.duration; })
    .toVector()
    .mean(); 
    cb(null, {type: 'overall', avg: avg});
};

Processor.prototype._averagePerCode = function(cb) {
  var self = this;
  var uniqueCodes = this.events.map(function(ev) { return ev.statusCode; }).unique();
  var averages = [];
  uniqueCodes.forEach(function(code) {
    var data = self.events.filter(function(ev) { return ev.statusCode === code });  
    var average = data
      .map(function(ev) { return ev.duration })
      .toVector()
      .mean();

      averages.push({type: 'code', avg: average, code: code});
  });
  
  cb(null, averages);
};


Processor.prototype._averagePerPath = function(cb) {
  var self = this;
  var uniquePaths = this.events.map(function(ev) { return ev.url; }).unique();
  var averages = [];
  uniquePaths.forEach(function(path) {
    var data = self.events.filter(function(ev) { return ev.url === path });  
    var average = data
      .map(function(ev) { return ev.duration })
      .toVector()
      .mean();

      averages.push({type: 'path', avg: average, path: path});
  });
  cb(null, averages);
};

Processor.prototype._requestsPerPath = function() {
  var uniqueCodes = this.events.map(function(ev) { return ev.url; }).frequency();
};

Processor.prototype._processErrors = function(cb) {
  var uniqueErrors = this.errs.map(function(ev) { return ev.message; }).unique();  
  var errs = [];
  var self = this;
  uniqueErrors.forEach(function(error) {
    var count = self.errs
      .filter(function(ev) { return ev.message == error })
      .length;
    errs.push({type: 'err', message: error, count: count});
  });
  cb(null, errs);
};
