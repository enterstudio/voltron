var zetta = require('zetta');
var uuid = require('uuid');
var MemoryDeviceRegistry = require('./memory_device_registry');
var MemoryPeerRegistry = require('./memory_peer_registry');
var LED = require('zetta-led-mock-driver');
var Photocell = require('zetta-photocell-mock-driver');

var hubName = uuid.v4();

var z = zetta({registry: new MemoryDeviceRegistry(), peerRegistry: new MemoryPeerRegistry()})
  .link(process.env.LINK_URL)
  .silent()
  .name(hubName)

for(var i = 0; i < process.env.SENSOR_NUM; i++) {
  z.use(Photocell);
}

for(var i = 0; i < process.env.ACTUATOR_NUM; i++) {
  z.use(LED);
}

z.pubsub.subscribe('_peer/connect', function(ev, socket) {
  var connectionId = socket.peer.connectionId;
  end = new Date().getTime();
  var timeToConnect = end - start;
  var msg = {'event': 'connect', name: hubName, connectionId: connectionId, start: start, end: end, timeToConnect: timeToConnect};  
  process.send(msg);
});

z.pubsub.subscribe('_peer/disconnect', function(ev, socket) {
  var connectionId = socket.peer.connectionId;
  var disconnected = new Date().getTime();
  if(end) {
    var duration = new Date().getTime() - end; 
  } else {
    var duration = 0;
  }
  var msg = {'event': 'disconnect', name: hubName, connectionId: connectionId, connected: end, disconnected: disconnected, duration: duration};
  process.send(msg);
});

var start = new Date().getTime();
var end = null;
z.listen(0);
  
