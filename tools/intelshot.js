var page = require('webpage').create();
var process = {
  env: require('system').env
};

phantom.addCookie({
      'name':     'csrftoken',
      'value':    process.env.csrftoken,
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': false,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});
phantom.addCookie({
      'name':     'ingress.intelmap.type',
      'value':    '0',
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': false,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});
phantom.addCookie({
      'name':     'ingress.intelmap.lat',
      'value':    '47.152211576532466',
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': false,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});
phantom.addCookie({
      'name':     'ingress.intelmap.lng',
      'value':    '19.101290868191647',
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': false,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});
phantom.addCookie({
      'name':     'ingress.intelmap.zoom',
      'value':    '11',
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': false,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});
phantom.addCookie({
      'name':     'ACSID',
      'value':    process.env.ACSID,
      'domain':   'www.ingress.com',
      'path':     '/',
      'httponly': true,
      'secure':   false,
      'expires':  (new Date()).getTime() + 3600
});

var timeout = null;
//load the page
//page.viewportSize = { width: 1920, height: 1080 };
page.viewportSize = { width: 19200/2, height: 10800/2 };
page.open('http://www.ingress.com/intel', function (status) {
  //fire callback to take screenshot after load complete
  page.onResourceReceived = function(response) {
    if (response.contentType == "application/json" && response.url == "http://www.ingress.com/rpc/dashboard.getThinnedEntitiesV2") {
      clearTimeout(timeout);
      console.log("[" + new Date() + "]" + response.url.replace(/.*rpc\//, '') + "#" + response.id + ": " + new Date().getTime());
      // page.render('shots/intel-' + (new Date().getTime()) + '.png');
      timeout = setTimeout(function() {
        console.log("[" + new Date() + "]" + " Last: " + new Date().getTime());
        page.render('shots/intel-' + (new Date().getTime()) + '.png');
        //finish
        phantom.exit();
      }, 30000);
    }
  };
});
