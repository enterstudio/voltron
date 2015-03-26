var Rx = require('rx');
var zRx = require('zrx');
var farmhash = require('farmhash');

var url = process.env.URL;

var events = [];
var graph = null;

function buildGraph(url) {
  var graph = {};
  var root = zRx().load(url);
  var servers = zRx().load(url).servers();
  var devices = zRx().load(url).servers().devices();

  var source = Rx.Observable.merge(root, servers, devices);

  source.subscribe(function(env) {
    var selfLink = env.response.body.links.filter(function(link) {
      return link.rel.indexOf('self') !== -1;  
    })[0];  

    var hash = farmhash.hash64(selfLink.href);
    graph[hash] = env.response.body;
  }); 
  return graph;
}

graph = buildGraph(url);
var interval = 1000 / process.env.REQUESTS_PER_SECOND;
var refresh = 3000 / process.env.REFRESH_INTERVAL;

setInterval(function() {
  graph = buildGraph(url); 
}, refresh)

setInterval(function() {  
  var hashKeys = Object.keys(graph);
  var randomIndex = Math.floor(Math.random() * (hashKeys.length));
  var key = hashKeys[randomIndex];
  var randomDoc = graph[key];
  var selfLink = randomDoc.links.filter(function(link) {
    return link.rel.indexOf('self') !== -1;  
  })[0];

  var start = new Date().getTime();
  var request = zRx().load(selfLink.href);

    request 
      .subscribe(function(env) {
        var end = new Date().getTime();
        var ev = {event: 'data', statusCode: env.response.statusCode, url: selfLink.href, start: start, end: end, duration: end - start};
        process.send(ev);
      });
}, interval);


