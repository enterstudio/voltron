var fork = require('child_process').fork;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var PeerFactory = module.exports = function(opts) {
  EventEmitter.call(this); 
  opts = opts || {};
  this.url = opts.url || 'http://zetta-cloud-2.herokuapp.com';
  this.sensors = opts.sensors || 0;
  this.actuators = opts.actuators || 0;
  this.templatePath = opts.templatePath || './lib/test_template.js';
  this.instances = opts.instances || 10;
  this.events = [];
};
util.inherits(PeerFactory, EventEmitter);

PeerFactory.prototype.start = function() {
  var self = this;
  var opts = {
    env: {
      "LINK_URL": this.url,
      "SENSOR_NUM": this.sensors,
      "ACTUATOR_NUM": this.actuators 
    }
  };

  this.procs = [];
  this.connects = 0;
  this.disconnects = 0;

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
      if(m.event === 'connect') {
        self.connects++; 
        if(self.connects === self.instances) {
          self.emit('complete');
        }
      } else if(m.event === 'disconnect') {
        self.disconnects++;
        self.emit('disconnect');
      }    
    });
     
  } 
};

PeerFactory.prototype.kill = function(cb) {
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
