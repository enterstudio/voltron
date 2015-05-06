var gauss = require('gauss');
var Vector = gauss.Vector;
var connectTimeStats = {};
var wsStats = {};
var statusCodeCount = {};
var requestStats = {};
var StatsResource = require('./stats_resource');

module.exports = function(server) {
  var peerQuery = server.where({ type: 'peer' });
  server.httpServer.cloud.add(StatsResource, connectTimeStats, wsStats, statusCodeCount, requestStats);
  var connectTimeEvents = new Vector();
  server.observe([peerQuery], function(peer) {
    var dataStream = peer.createReadStream('data');  
    dataStream.on('data', function(d) {
      var data = d.data;
      if(data.event === 'connect') {
        connectTimeEvents.push(data.timeToConnect);  
        connectTimeStats.average = connectTimeEvents.mean();
        connectTimeStats.min = connectTimeEvents.min();
        connectTimeStats.max = connectTimeEvents.max();
      }
    });
  });  

  var wsQuery = server.where({ type: 'ws' });
  server.observe([wsQuery], function(ws) {
    var dataStream = ws.createReadStream('data');
    dataStream.on('data', function(d) {
      var data = d.data;  
      var topic = data.clientId + '/' + data.topic;
      if(data.event === 'data') {
         if(!wsStats[topic] || wsStats[topic].timestamp < data.timestamp) {
          wsStats[topic] = data;   
        } 
      }
    });  
  });

  var apiQuery = server.where({ type: 'api' });
  server.observe([apiQuery], function(api) {
    var dataStream = api.createReadStream('data');
    var requestDurationEvents =  new Vector();
    dataStream.on('data', function(d) {
      var data = d.data;
      requestDurationEvents.push(data.duration);
      if(!statusCodeCount[data.statusCode]) {
        statusCodeCount[data.statusCode] = 1;  
      } else {
        statusCodeCount[data.statusCode]++;
      }
      
      requestStats.average = requestDurationEvents.mean();
      requestStats.min = requestDurationEvents.min();
      requestStats.max = requestDurationEvents.max();
    });  
  });

};



