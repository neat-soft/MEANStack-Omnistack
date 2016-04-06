'use strict';
MathJax.HTML.Cookie.Set("menu", {});
MathJax.Hub.Config({
  skipStartupTypeset: true,
  messageStyle: "none",
  extensions: ["tex2jax.js", "mml2jax.js", "MathML/content-mathml.js", "MathML/mml3.js"],
  jax: ["input/MathML", "input/TeX", "output/SVG", "output/HTML-CSS", "output/NativeMML", "output/CommonHTML"],
  "HTML-CSS": {
    availableFonts: [],
    styles: {".MathJax_Preview": {visibility: "hidden"}},
    showMathMenu: false
  },
  "SVG": {
    availableFonts: [],
    styles: {".MathJax_Preview": {visibility: "hidden"}},
    showMathMenu: false
  },
  "NativeMML": {
    availableFonts: [],
    styles: {".MathJax_Preview": {visibility: "hidden"}},
    showMathMenu: false
  },
  "CommonHTML": {
    availableFonts: [],
    styles: {".MathJax_Preview": {visibility: "hidden"}},
    showMathMenu: false
  }
});
MathJax.Hub.Register.StartupHook("HTML-CSS Jax Ready", function () {
  var FONT = MathJax.OutputJax["HTML-CSS"].Font;
  FONT.loadError = function (font) {
    MathJax.Message.Set("Can't load web font TeX/" + font.directory, null, 2000);
    document.getElementById("noWebFont").style.display = "";
  };
  FONT.firefoxFontError = function (font) {
    MathJax.Message.Set("Firefox can't load web fonts from a remote host", null, 3000);
    document.getElementById("ffWebFont").style.display = "";
  };
});

(function (HUB) {

  var MINVERSION = {
    Firefox: 3.0,
    Opera: 9.52,
    MSIE: 6.0,
    Chrome: 0.3,
    Safari: 2.0,
    Konqueror: 4.0,
    Unknown: 10000.0 // always disable unknown browsers
  };

  if (!HUB.Browser.versionAtLeast(MINVERSION[HUB.Browser] || 0.0)) {
    HUB.Config({
      jax: [],                   // don't load any Jax
      extensions: [],            // don't load any extensions
      "v1.0-compatible": false   // skip warning message due to no jax
    });
    setTimeout('document.getElementById("badBrowser").style.display = ""', 0);
  }

})(MathJax.Hub);

MathJax.Hub.Register.StartupHook("End", function () {
  var HTMLCSS = MathJax.OutputJax["HTML-CSS"];
  if (HTMLCSS && HTMLCSS.imgFonts) {
    document.getElementById("imageFonts").style.display = ""
  }
});
angular.module('fsaApp')
  .directive('mathjaxBind', function () {
    return {
      restrict: "A",
      controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
        $scope.$watch($attrs.mathjaxBind, function (value) {
          //$($element).parent().find('math').wrap("<script type='math/mml'></script>");
          $element.html(value);
          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        });
      }]
    };
  });