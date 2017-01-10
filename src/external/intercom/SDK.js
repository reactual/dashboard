export function loadIntercomWidget(lead) {
  if (window.intercomSettings && window.intercomSettings.app_id !== lead.appId) {
      unloadIntercomWidget()
      delete window.Intercom
  }

  window.intercomSettings = lead.settings
  include(lead.appId)
}

export function unloadIntercomWidget() {
  if (window.Intercom) {
    window.Intercom('shutdown')
  }
}

// Copied from https://developers.intercom.com/docs/single-page-app
// and turned app id into a parameter rather than a global variable
function include(appId) {
  var w = window;
  var ic = w.Intercom;

  if (typeof ic === "function") {
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var d = document;
    var i = function() { i.c(arguments) };

    i.q = [];
    i.c = function(args) { i.q.push(args) };

    w.Intercom = i;

    function l() {
      var s = d.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://widget.intercom.io/widget/' + appId;

      var x = d.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    }

    if (w.attachEvent) {
      w.attachEvent('onload', l);
    } else {
      w.addEventListener('load', l, false);
    }
  }
}
