var gauss = require('gauss');
var csv = require('fast-csv');

module.exports = function(opts, peerFactory, showHeaders) {
  var connectEvents = peerFactory.events.filter(function(ev) { return ev.event === 'connect' });  
  var disconnectEvents = peerFactory.events.filter(function(ev) { return ev.event === 'disconnect' });

  var connectTimeV = new gauss.Vector(connectEvents.map(function(e) {
    return e.timeToConnect; 
  }));
  
  var peerEvents = {};
  connectEvents.forEach(function(e) {
    if (!peerEvents[e.name]) {
      peerEvents[e.name] = [];
    }
    peerEvents[e.name].push(e);
  });

  disconnectEvents.forEach(function(e) {
    if (!peerEvents[e.name]) {
      peerEvents[e.name] = [];
    }
    peerEvents[e.name].push(e);
  });


  var connectsPerPeerV = new gauss.Vector(Object.keys(peerEvents).map(function(name) {
    return peerEvents[name].length;
  }));

  var csvStream = csv.createWriteStream({ headers: showHeaders });
  csvStream.pipe(process.stdout);

  csvStream.write({ 
    url: opts.url,
    sensors: opts.sensors,
    actuators: opts.actuators,
    instances: opts.instances,
    ConnectTimeMin: connectTimeV.min(),
    ConnectTimeMax: connectTimeV.max(),
    ConnectTimeMedian: connectTimeV.median(),
    ConnectTimeMean: connectTimeV.mean(),
    ConnectTimeStdev: connectTimeV.stdev(),
    
    ConnectAttemptsMin: connectsPerPeerV.min(),
    ConnectAttemptsMax: connectsPerPeerV.max(),
    ConnectAttemptsMedian: connectsPerPeerV.median(),
    ConnectAttemptsMean: connectsPerPeerV.mean(),
    ConnectAttemptsStdev: connectsPerPeerV.stdev()
  });
  csvStream.end();
  console.log();
}
