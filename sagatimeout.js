// Generated by CoffeeScript 1.9.2
var chrono, iso8601, moment;

moment = require('moment-timezone');

chrono = require('chronological');

moment = chrono(moment);

iso8601 = require('./iso8601');

module.exports = function(logwatcher, options) {
  var handle, ontimeout, timeoutsforsagas;
  timeoutsforsagas = {};
  ontimeout = options.ontimeout;
  if (ontimeout == null) {
    ontimeout = function() {};
  }
  handle = logwatcher.onlog(function(url, instance) {
    var _, key, ref, ref1, results, timeout, timeouts, timeoutsforsaga;
    if (timeoutsforsagas[url] == null) {
      timeoutsforsagas[url] = {};
    }
    timeoutsforsaga = timeoutsforsagas[url];
    if (timeoutsforsaga[instance.key] == null) {
      timeoutsforsaga[instance.key] = {};
    }
    timeouts = timeoutsforsaga[instance.key];
    ref = instance.log.timeouttombstones;
    for (key in ref) {
      _ = ref[key];
      if (timeouts[key] == null) {
        continue;
      }
      timeouts[key].cancel();
      console.log("Removing timeout " + key);
      delete timeouts[key];
    }
    ref1 = instance.log.timeouts;
    results = [];
    for (key in ref1) {
      timeout = ref1[key];
      if (timeouts[key] != null) {
        continue;
      }
      results.push((function(key, timeout) {
        console.log("Creating timeout " + key + " " + (timeout.format(iso8601)));
        return timeouts[key] = timeout.timer(function(value) {
          delete timeouts[key];
          return ontimeout(url, instance.key, key, value);
        });
      })(key, timeout));
    }
    return results;
  });
  return {
    destroy: function() {
      var _, timeout, timeouts, timeoutsforsaga;
      handle.off();
      for (_ in timeoutsforsagas) {
        timeoutsforsaga = timeoutsforsagas[_];
        for (_ in timeoutsforsaga) {
          timeouts = timeoutsforsaga[_];
          for (_ in timeouts) {
            timeout = timeouts[_];
            timeout.cancel();
          }
        }
      }
      return timeoutsforsagas = {};
    }
  };
};
