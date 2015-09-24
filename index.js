// Generated by CoffeeScript 1.9.2
var bus, coordinator, dispatcher, exittimeout, hub, resolute, sagainterval, sagalock, sagalog, sagatimeout, subscriptions;

sagalog = require('./sagalog');

sagalock = require('./sagalock');

resolute = require('resolute');

subscriptions = require('resolute/subscriptions');

dispatcher = require('./dispatcher');

coordinator = require('./coordinator');

sagatimeout = require('./sagatimeout');

sagainterval = require('./sagainterval');

hub = require('odo-hub/hub')(require('odo-hub/dispatch_parallel')());

sagalog = sagalog('docker:8500');

sagalock = sagalock('docker:8500');

subscriptions = subscriptions(bus);

dispatcher = dispatcher(subscriptions, hub);

coordinator = coordinator(sagalog, sagalock, {
  onmessage: dispatcher.onmessage,
  ontimeout: dispatcher.ontimeout,
  oninterval: dispatcher.oninterval
});

sagatimeout = sagatimeout(coordinator, {
  ontimeout: coordinator.ontimeout
});

sagainterval = sagainterval(coordinator, {
  oninterval: coordinator.oninterval
});

bus = resolute({
  bind: 'tcp://127.0.0.1:12345',
  datadir: './12345'
});

subscriptions.bind('weather update', 'tcp://127.0.0.1:12346');

dispatcher.register('sagas/saga1/', require('./testsaga'));

sagalog.watch('sagas/saga1/');

hub.every('message', function(e, cb) {
  return coordinator.onmessage('sagas/saga1/', 'exe1', 'message', e, cb);
});

setTimeout(function() {
  hub.emit('message', {
    msgid: 1,
    value: 'awesome'
  });
  return hub.emit('message', {
    msgid: 2,
    value: 'awesome'
  });
}, 500);

setTimeout(function() {
  return hub.emit('message', {
    msgid: 3,
    value: 'awesome'
  });
}, 5000);

exittimeout = null;

process.on('SIGINT', function() {
  var close, exit;
  close = function() {
    clearTimeout(exittimeout);
    bus.close();
    coordinator.destroy();
    sagalog.destroy();
    return sagalock.destroy();
  };
  exit = function() {
    close();
    return process.exit(0);
  };
  if (exittimeout != null) {
    exit();
  }
  exittimeout = setTimeout(exit, 10000);
  console.log('Waiting for queues to empty.');
  console.log('(^C again to quit)');
  sagatimeout.destroy();
  sagainterval.destroy();
  return bus.drain(function() {
    return coordinator.drain(function() {
      return dispatcher.end(function() {
        return close();
      });
    });
  });
});
