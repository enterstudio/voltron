var fork = require('child_process').fork;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var path = require('path');

var TrafficFactory = module.exports = function(opts) {
  EventEmitter.call(this);
  opts = opts || {};
  this.url = opts.url || 'http://zetta-cloud-2.herokuapp.com/';
  this.clients = opts.clients || 1;
  this.requestsPerSecond = opts.requestsPerSecond || 100;
  this.refreshInterval = opts.refreshInterval || 1;
  this.templatePath = opts.templatePath || path.join('./lib/api_template.js');
  this.requests = opts.requests || 100;
};
util.inherits(TrafficFactory, EventEmitter);

TrafficFactory.prototype.start = function() {
  var self = this;
  var opts = {
    env: {
      "URL": this.url,
      "REQUESTS_PER_SECOND": this.requestsPerSecond,
      "REFRESH_INTERVAL": this.refreshInterval 
    }
  };

  this.events = [];
  this.visited = [];
  this.procs = [];
  this.connects = 0;
  this.disconnects = 0;

  for(var i = 0; i < this.clients; i++) {
    var forked = fork(this.templatePath, opts);
    this.procs.push(forked);

    forked.on('error', function(e) {
      console.log(e);
      forked.kill(0);  
    });

    forked.on('message', function(m) {
      if(m.event === 'data') {
        self.events.push(m);
      } else if(m.event === 'visited') {    
        self.visited.push(m);
      } 
      self.emit(m.event, m);
    });

  }
};

TrafficFactory.prototype.kill = function(cb) {
  var counter = 0;
  var self = this;
  this.procs.forEach(function(proc) {
    proc.on('close', function() {
      counter++;  
      if(counter == self.instances) {
        if(cb) {
          cb();  
        } else {
          self.emit('close');  
        }
      }
    });
    proc.kill();  
  });  
};
