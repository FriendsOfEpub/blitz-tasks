// Create the inline console
var loggerStyle = document.createElement('style');
loggerStyle.type = 'text/css';
loggerStyle.id = 'console-styles';
loggerStyle.textContent = '#console {width: 100%;min-height: 100vh;white-space: pre-wrap; word-wrap: break-word; -webkit-tab-size: 2; -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2;} #console span {display: block; margin-top: 16px;}';
document.head.appendChild(loggerStyle);

var logger = document.createElement('pre');
pre.id = 'console';
pre.innerHTML = '<span>Init: the console seems to work…</span>';
document.body.insertBefore(logger, document.body.firstChild);

// Pass logs, (explicit) warnings and (explicit) errors to the inline console
['log','warn','error'].forEach(function (verb) {
  console[verb] = (function (method, verb, log) {
    return function (text) {
      method(text);
      var msg = document.createElement('span');
      msg.classList.add(verb);
      msg.textContent = verb + ': ' + text;
      logger.appendChild(msg);
    };
  })(console[verb].bind(console), verb, logger);
});