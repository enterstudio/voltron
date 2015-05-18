var csv = require('fast-csv');

module.exports = function(trafficFactory, showHeaders) {
  var stream = csv.createWriteStream({headers: showHeaders});
  stream.pipe(process.stdout);

  trafficFactory.events.forEach(function(e) {
    delete e.event;
    stream.write(e);  
  }); 

  stream.end();
  console.log();
};
