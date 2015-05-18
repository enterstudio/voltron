var fork = require('child_process').fork;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var path = require('path');

var WsFactory = module.exports = function(opts) {
  EventEmitter.call(this); 
  opts = opts || {};
  this.url = opts.url || 'http://zetta-cloud-2.herokuapp.com';
  this.templatePath = opts.templatePath || path.join(__dirname, 'ws_template.js');
  this.instances = opts.instances || 10;
  this.events = [];
  this.usage = {};
};
util.inherits(WsFactory, EventEmitter);

WsFactory.prototype.start = function() {
  var self = this;
  var opts = {
    env: {
      "LINK_URL": this.url
    }
  };

  this.procs = [];

  for(var i = 0; i < this.instances; i++) {
    var forked = fork(this.templatePath, opts);
    this.procs.push(forked);

    forked.on('error', function(e) {
      console.log(e);
      forked.kill(0);  
    });

    forked.on('message', function(m) {
      self.events.push(m);
      self.emit(m.event, m);
      if(m.event === 'data') {
        var topic = m.clientId + '/' + m.topic;
        if(!self.usage[topic] || self.usage[topic].timestamp < m.timestamp) {
          self.usage[topic] = m;   
        }
      }
    });
  } 
};

WsFactory.prototype.kill = function(cb) {
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
