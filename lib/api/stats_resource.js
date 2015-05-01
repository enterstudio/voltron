var StatsResource = module.exports = function(connect, ws, statusCode, duration) {
  this.connect = connect;
  this.ws = ws;
  this.statusCode = statusCode;
  this.duration = duration;  
};

StatsResource.prototype.init = function(config) {
  config
    .path('/voltron')
    .get('/', this.show);  
};

StatsResource.prototype.show = function(env, next) {
  var resp = {
    connect: this.connect,
    ws: this.ws,
    statusCode: this.statusCode,
    duration: this.duration 
  };

  env.response.body = resp;
  env.response.statusCode = 200;
  next(env);
};
