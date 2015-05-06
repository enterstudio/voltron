var Device = require('zetta').Device;
var util = require('util');
var Factory = require('../traffic_factory');

var ApiDevice = module.exports = function(opts) {
  Device.call(this); 
  this.factoryOpts = opts;
  this._factory = new Factory(opts);
};
util.inherits(ApiDevice, Device);

ApiDevice.prototype.init = function(config) {
  var self = this;
  config
    .name('api')
    .type('api')
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
    .map('configure', function(url, clients, cb) {
      var opts = {
        url: url,
        clients: Number(clients)
      };  

      this.factoryOpts = opts;
      this._factory = new Factory(opts);
      self._factory.on('data', function(d) {
        self._dataStream.write(d);  
      });  
      cb();
    }, [{name: 'url', type: 'url'}, {name: 'clients', type: 'number'}]);
};
