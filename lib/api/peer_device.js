var Device = require('zetta').Device;
var util = require('util');
var Factory = require('../peer_factory');

var PeerDevice = module.exports = function(opts) {
  Device.call(this);    
  this.factoryOpts = opts;
  this._factory = new Factory(this.factoryOpts);
};
util.inherits(PeerDevice, Device);

PeerDevice.prototype.init = function(config) {
  var self = this;
  config
    .name('peer')
    .type('peer')
    .state('standby')
    .when('standby', { allow: ['start', 'configure'] })
    .when('started', { allow: ['stop'] })
    .stream('data', function(stream) {
      self._dataStream = stream;
    })
    .map('start', function(cb) {
      self.state = 'started';
      self._factory.start();
      cb();  
    })
    .map('stop', function(cb) {
      self.state = 'standby';
      self._factory.kill();
      cb(); 
    })
    .map('configure', function(url, instances, sensors, actuators, cb) {

      var opts = {
        url: url,
        instances: Number(instances),
        sensors: Number(sensors),
        actuators: Number(actuators)  
      };
      self.factoryOpts = opts;
      self._factory = new Factory(opts);
      self._factory.on('connect', function(d) {
        self._dataStream.write(d);  
      });  

      self._factory.on('disconnect', function(d) {
        if(d) {
          self._dataStream.write(d);  
        }  
      });
      cb();
    }, [{name: 'url', type:'url'}, {name:'instances', type:'number'}, {name:'sensors', type:'number'}, {name:'actuators', type:'number'}]); 
};
