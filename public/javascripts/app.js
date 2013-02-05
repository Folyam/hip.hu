var App = {
  Utils: {},
  Core: (function() {
    var registeredModules = {};
    var _init = function () {
      for(var name in registeredModules) {
        if (!registeredModules.hasOwnProperty(name)) {
          continue;
        }

        var canIRun = true;
        if (registeredModules[name].hasOwnProperty('dependencies')) {
          for(var i = 0, _l = registeredModules[name].dependencies.length; i < _l; i++) {
            if (jQuery(registeredModules[name].dependencies[i]).length < 1) {
              canIRun = false;
              break;
            }
          }
        }

        if (!canIRun) {
          continue;
        }

        registeredModules[name].module.init();
      }
    };

    var _register = function(name, module, dependencies) {
      var object = module();
      if (!object.hasOwnProperty('init')) {
        throw "Hiba";
      }
      registeredModules[name] = {
        module: object,
        dependencies: dependencies
      };

      return name;
    }
    return {
      init: _init,
      register: _register
    }
  })()
};


App.Core.register("save-codename", function() {
  var root;

  var events = {
    clickOnSave: function() {
      var value = root.find('input').val();
      if (value == "") {
        return alert('Nem adtál meg nevet!');
      }

      jQuery.post("/me/save", {name: "codename", value: value}, function(resp) {
        console.log(resp);
        if (resp.success) {
          return root.parent().html("<p>A neved: <strong>" + resp.value + "</strong></p>");
        }
      }, "json");
    }
  };

  return {
    init: function() {
      root = jQuery('[data-module="save-codename"]');
      return root.find("button").click(events.clickOnSave);
    }
  }
}, ['[data-module="save-codename"]']);

App.Core.register("check-faction-for-validation", function() {
  var hasFaction = function() {
    jQuery.get("/me/faction.json", function(resp) {
      if (resp.faction != null) {
        window.location.reload();
      }
    }, "json");
  };
  return {
    init: function() {
      setInterval(hasFaction, 5000);
    }
  };
}, ['.check-faction-for-validation']);

jQuery(function() {
  return App.Core.init();
});


// Google+ Event (Page)
function plusone_me( obj ) {
  var value = 0;
  if (obj.state == 'on') {
    value = 1;
  } else {
    value = -1;
  }
  _gaq.push(['_trackEvent', 'Social', obj.state, 'Google+', value]);
}
