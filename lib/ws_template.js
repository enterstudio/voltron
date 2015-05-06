var zRx = require('zrx');
var Rx = require('rx');
var cell = new Rx.ReplaySubject();
var uuid = require('uuid');

var clientId = uuid.v4();

zRx()
  .load(process.env.LINK_URL)
  .server()
  .device()
  .subscribe(cell);

var link = zRx(cell);
var client = link.client
  .link('http://rels.zettajs.io/object-stream');

var usage = client
  .flatMap(function(env) {
    return Rx.Observable.create(function(observer) {

      env.response.on('message', function(message) {
        message = JSON.parse(message);
        observer.onNext({event: 'data', clientId: clientId, bytesReceived: env.response.bytesReceived, topic: message.topic, timestamp: message.timestamp });   
      });

      env.response.on('close', function() {
        observer.onCompleted();
      });

      env.response.on('error', function(err) {
        observer.onError();
      });

      return function() {
        env.response.close();
      };  
    });
  });

usage 
  .subscribe(function(e) {
    process.send(e);   
  }, function(err) {
    process.send({event: 'error', error: err});  
  });

process.on('SIGHUP', function() {
  process.kill();  
});
