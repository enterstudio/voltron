var Rx = require('rx');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Processor = module.exports = function(data) {
  EventEmitter.call(this);  
  this.events = Rx.Observable.from(data);
};
util.inherits(Processor, EventEmitter);

Processor.prototype.start = function(cb) {
  var self = this;
  var totalAverage = Rx.Observable.fromCallback(this._totalAverage, this);
  var averagePerCode = Rx.Observable.fromCallback(this._averagePerCode, this);
  var averagePerPath = Rx.Observable.fromCallback(this._averagePerPath, this);

  var dataPoints = [];
  var s1 = totalAverage();
  var s2 = averagePerCode();
  var s3 = averagePerPath();
  
  var source = Rx.Observable.merge(s1, s2, s3);

  source.subscribe(function(x) { 
    dataPoints.push(x);
    
  }, function(e) {}, function() { 
    var mergedData = [];
    dataPoints.forEach(function(dataPoint) {
      mergedData = mergedData.concat(dataPoint); 
    });
    cb(mergedData);
  });
};

Processor.prototype._totalAverage = function(cb) {
  var dataPoints = [];
  var source = this.events
    .average(function(ev) {
      return ev.duration;  
    }).map(function(avg) {
      return {type: 'overall', avg: avg};  
    })
    .subscribe(function(d) {
      dataPoints.push(d);
    }, 
    function(){}, 
    function(){
      cb(dataPoints);  
    });
};

Processor.prototype._averagePerCode = function(cb) {
  var dataPoints = [];
  var statusCodes = this.events
    .groupBy(function(o) {
      return o.statusCode;  
    }).subscribe(function(obs) {
      var avg = obs
        .average(function(ev) {
          return ev.duration;  
        });  

      var code = obs
        .distinct(function(ev) {
          return ev.statusCode;  
        })
        .select(function(ev) {
          return ev.statusCode;  
        });


      var source = avg.forkJoin(code, function(avg, code) {
        return {type: 'code', avg: avg, code: code};  
      })
      .subscribe(function(d) {
        dataPoints.push(d);  
      }
      ,function(e) {}
      ,function() {
       cb(dataPoints); 
      });
    });  
};


Processor.prototype._averagePerPath = function(cb) {
  var dataPoints = [];

  var okStatusCode = this.events
    .groupBy(function(o) {
       return o.url; 
    }).subscribe(function(obs) {
      var avg = obs
      .filter(function(ev) {
        return ev.statusCode === 200;
      })
      .average(function(ev) {
        return ev.duration;
      });


      var path = obs
        .distinct(function(o) {
          return o.url;  
        })
        .select(function(o) {
          return o.url;  
        });

      var source = avg.forkJoin(path, function(avg, path) {
        return { type: 'path', avg: avg, path: path };  
      }).
      subscribe(function(d){
        dataPoints.push(d);  
      }, 
      function() {}, 
      function() {
        cb(dataPoints);
      });

    }); 
};

Processor.prototype._requestsPerPath = function() {
  
};
