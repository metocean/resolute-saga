// Generated by CoffeeScript 1.9.2
var chrono, iso8601, moment;

moment = require('moment-timezone');

chrono = require('chronological');

moment = chrono(moment);

iso8601 = require('./iso8601');

module.exports = function(sagalog, options) {
  var handle, intervalsforsagas, oninterval;
  intervalsforsagas = {};
  oninterval = options.oninterval;
  if (oninterval == null) {
    oninterval = function() {};
  }
  handle = sagalog.onlog(function(url, instance) {
    var _, interval, intervals, intervalsforsaga, key, ref, ref1, results;
    if (intervalsforsagas[url] == null) {
      intervalsforsagas[url] = {};
    }
    intervalsforsaga = intervalsforsagas[url];
    if (intervalsforsaga[instance.key] == null) {
      intervalsforsaga[instance.key] = {};
    }
    intervals = intervalsforsaga[instance.key];
    ref = instance.log.intervaltombstones;
    for (key in ref) {
      _ = ref[key];
      if (intervals[key] == null) {
        continue;
      }
      intervals[key].end();
      delete intervals[key];
    }
    ref1 = instance.log.intervals;
    results = [];
    for (key in ref1) {
      interval = ref1[key];
      if (intervals[key] != null) {
        intervals[key].end();
        delete intervals[key];
      }
      results.push((function(key, interval) {
        var timer, value;
        value = interval.value;
        if (value != null) {
          value++;
        }
        timer = interval.anchor.every(interval.count, interval.unit);
        return intervals[key] = timer.timer(value, function(value, count) {
          return oninterval(url, instance.key, key, count, value);
        });
      })(key, interval));
    }
    return results;
  });
  return {
    destroy: function() {
      var _, interval, intervals, intervalsforsaga;
      handle.off();
      for (_ in intervalsforsagas) {
        intervalsforsaga = intervalsforsagas[_];
        for (_ in intervalsforsaga) {
          intervals = intervalsforsaga[_];
          for (_ in intervals) {
            interval = intervals[_];
            interval.end();
          }
        }
      }
      return intervalsforsagas = {};
    }
  };
};
