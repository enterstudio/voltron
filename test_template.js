var zetta = require('zetta');
var uuid = require('uuid');
var MemoryDeviceRegistry = require('./memory_device_registry');
var MemoryPeerRegistry = require('./memory_peer_registry');
var LED = require('zetta-led-mock-driver');
var Photocell = require('zetta-photocell-mock-driver');

var z = zetta({registry: new MemoryDeviceRegistry(), peerRegistry: new MemoryPeerRegistry()})
  .link(process.env.LINK_URL)
  .silent()
  .name(uuid.v4())

for(var i = 0; i < process.env.SENSOR_NUM; i++) {
  z.use(Photocell);
}

for(var i = 0; i < process.env.ACTUATOR_NUM; i++) {
  z.use(LED);
}

z.pubsub.subscribe('_peer/connect', function() {
  var msg = {'event': 'connect'};  
  process.send(msg);
});

z.pubsub.subscribe('_peer/disconnect', function() {
  var msg = {'event': 'disconnect'};
  process.send(msg);
});

z.listen(0);
  
