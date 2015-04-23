var zRx = require('zrx');
var Rx = require('rx');
var cell = new Rx.ReplaySubject();


zRx()
  .load(process.env.LINK_URL)
  .server()
  .device(function(d) {
    return d.type == 'photocell';  
  })
  .subscribe(cell);

var link = zRx(cell);
var client = link.client
  .link('http://rels.zettajs.io/object-stream', 'intensity');


var usage = client
  .flatMap(function(env) {
    return Rx.Observable.create(function(observer) {
      env.response.on('message', function(message) {
        message = JSON.parse(message);
        observer.onNext({ bytesReceived: env.response.bytesReceived, topic: message.topic });   
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
  });
