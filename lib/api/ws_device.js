var Device = require('zetta').Device;
var util = require('util');
var Factory = require('../ws_factory');

var WsDevice = module.exports = function(opts) {
  Device.call(this);
  this.factoryOpts = opts;
  this._factory = new Factory(this.factoryOpts);
};
util.inherits(WsDevice, Device);

WsDevice.prototype.init = function(config) {
  var self = this;
  config
    .name('ws')
    .type('ws')
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
    .map('configure', function(url, instances, cb) {
      var opts = {
        url: url,
        instances: Number(instances)
      };
      self.factoryOpts = opts;
      self._factory = new Factory(opts);
      self._factory.on('data', function(d) {
        self._dataStream.write(d);  
      });
      cb();
    }, [ {name: 'url', type:'url'}, {name: 'instances', type: 'number'}]); 
};
