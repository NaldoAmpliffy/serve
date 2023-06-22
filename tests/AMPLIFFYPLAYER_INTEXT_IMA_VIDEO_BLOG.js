(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceSizeOrientationAware = getDeviceSizeOrientationAware;
var _orientation = require("./orientation");
function getDeviceSizeOrientationAware() {
  var orientation = (0, _orientation.getOrientation)();
  var screenWidth, screenHeight;
  if (orientation === "landscape-primary" || orientation === "landscape-secondary") {
    if (screen.width > screen.height) {
      screenWidth = screen.width;
      screenHeight = screen.height;
    } else {
      screenWidth = screen.height;
      screenHeight = screen.width;
    }
  } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
    if (screen.width > screen.height) {
      screenWidth = screen.height;
      screenHeight = screen.width;
    } else {
      screenWidth = screen.width;
      screenHeight = screen.height;
    }
  } else if (orientation === undefined) {
    screenWidth = screen.width;
    screenHeight = screen.height;
  }
  return {
    screenWidth: screenWidth,
    screenHeight: screenHeight
  };
}

},{"./orientation":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOrientation = getOrientation;
function getOrientation() {
  var orientationByAPI = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
  if (!orientationByAPI && window.orientation) {
    switch (window.orientation) {
      case 0:
        return 'portrait-primary';
      case 90:
        return 'landscape-primary';
      case -90:
        return 'portrait-secondary';
      case 180:
        return 'landscape-secondary';
    }
    return orientationByAPI;
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isShadowDOMAvailable = isShadowDOMAvailable;
var _version = require("./version");
function isShadowDOMAvailable() {
  // TODO: Change this when finished testing, to use the most used technology whenever we can.
  var chromeVersion = (0, _version.getChromeVersion)();
  return !document.head.createShadowRoot && document.head.attachShadow;
  return !document.head.createShadowRoot && document.head.attachShadow && (chromeVersion >= 85 || document.location && document.location.hostname && document.location.hostname.match(/asivaespana.com$/));
}

},{"./version":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChromeVersion = getChromeVersion;
function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeHtml = decodeHtml;
exports.escapeHtml = escapeHtml;
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IsMobile = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var IsMobile = /*#__PURE__*/function () {
  function IsMobile(viewPortWidth, viewPortHeight) {
    _classCallCheck(this, IsMobile);
    this.viewPortWidth = viewPortWidth;
    this.viewPortHeight = viewPortHeight;
  }
  _createClass(IsMobile, [{
    key: "isMobile",
    value: function isMobile() {
      return this.viewPortWidth < 460 || this.viewPortHeight < 460 || this.isIOS() || this.isAndroid();
    }
  }, {
    key: "isIOS",
    value: function isIOS() {
      // iPad on iOS 13 detection (/Mac/.test(navigator.userAgent) && "ontouchend" in document)
      return /iPad Simulator|iPhone Simulator|iPod Simulator|iPhone|iPad|iPod/i.test(navigator.platform) || /Mac/.test(navigator.userAgent) && "ontouchend" in document;
    }
  }, {
    key: "isAndroid",
    value: function isAndroid() {
      return /Android/i.test(navigator.userAgent);
    }
  }, {
    key: "isSafari",
    value: function isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
  }]);
  return IsMobile;
}();
exports.IsMobile = IsMobile;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTopViewPortSize = getTopViewPortSize;
exports.getViewPortSize = getViewPortSize;
function getViewPortSize() {
  var viewPortSize = [0, 0];
  try {
    // $FlowFixMe
    var validDocumentSize = document.documentElement && document.documentElement.clientHeight < 1.5 * window.innerHeight;
    // $FlowFixMe
    viewPortSize[0] = Math.max(validDocumentSize ? document.documentElement.clientWidth : 0, window.innerWidth || 0);
    // $FlowFixMe
    viewPortSize[1] = Math.max(validDocumentSize ? document.documentElement.clientHeight : 0, window.innerHeight || 0);
  } catch (e) {
    console.log("Unable to grab current viewport dimensions");
  }
  return viewPortSize;
}
function getTopViewPortSize() {
  var viewPortSize = [0, 0];
  try {
    // $FlowFixMe
    var validDocumentSize = document.documentElement && document.documentElement.clientHeight < 1.5 * window.innerHeight;
    // $FlowFixMe
    viewPortSize[0] = Math.max(validDocumentSize ? document.documentElement.clientWidth : 0, window.innerWidth || 0);
    // $FlowFixMe
    viewPortSize[1] = Math.max(validDocumentSize ? document.documentElement.clientHeight : 0, window.innerHeight || 0);
  } catch (e) {
    console.log("Unable to grab current viewport dimensions");
  }
  try {
    // $FlowFixMe
    var _validDocumentSize = top.document.documentElement && top.document.documentElement.clientHeight < 1.5 * top.innerHeight;
    viewPortSize[0] = Math.max(_validDocumentSize ? top.document.documentElement.clientWidth : 0, top.innerWidth || 0);
    viewPortSize[1] = Math.max(_validDocumentSize ? top.document.documentElement.clientHeight : 0, top.innerHeight || 0);
  } catch (e) {}
  return viewPortSize;
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cLog = cLog;
exports.imgLog = imgLog;
exports.log = log;
exports.logLevel = logLevel;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var urlDebugParameter, urlRemoteDebugParameter;
try {
  urlDebugParameter = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
  urlRemoteDebugParameter = window.location.search && window.location.search.match(/[?&]amp_deb=1/);
} catch (e) {}
function logLevel(level) {
  try {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (top && _typeof(top.ampTV) === 'object' && _typeof(top.ampTV.options) === 'object' && top.ampTV.options.logLevel && top.ampTV.options.logLevel >= level) console.log.apply(this, args);else if (urlDebugParameter) console.log.apply(this, args);
  } catch (e) {}
}
function log() {
  logLevel(1, arguments);
}
function cLog() {
  logLevel(1, arguments);
  try {
    if (urlRemoteDebugParameter) navigator.sendBeacon('https://securepubads.g.doubleclick.net/ads?log=' + encodeURIComponent(JSON.stringify(arguments)), {});
  } catch (e) {}
}
function imgLog(url, done, fail) {
  var img = new Image();
  if (done) img.onload = done;
  if (fail) img.onerror = fail;
  img.src = url;
}

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSharer = buildSharer;
var _htmlEntities = require("./dom/htmlEntities");
var _log = require("./log/log");
var _this = void 0;
/** adds a live event handler akin to jQuery's on() */
function addLiveEventListeners(doc, selector, event, handler) {
  (0, _log.cLog)("ADD EVENT: ", doc, doc.querySelector("body"), selector, event, handler);
  var body = doc.querySelector("body") || doc;
  body.addEventListener(event, function (evt) {
    (0, _log.cLog)("EVENT: ", doc, selector, event, handler, evt);
    var target = evt.target;
    while (target != null) {
      var isMatch = target.matches(selector);
      if (isMatch) {
        handler(evt);
        return;
      }
      target = target.parentElement;
    }
  }, true);
}
var win = top;
var doc = win.document;
var visible = false;
var customizeSharers = function customizeSharers(post) {
  while (post && !post.matches('[data-post-id]')) post = post.parentElement;
  if (!post) return;
  var postId = post.getAttribute('data-post-id');
  if (!postId) return;
  var anchor = doc.querySelector('.Igw0E.IwRSH.eGOV_._4EzTm.HVWg4');
  var toDelete = [];
  for (var i = 0; i < anchor.children.length; i++) if (anchor.children[i].nodeName === 'A') toDelete.push(anchor.children[i]);
  toDelete.forEach(function (x) {
    return x.remove();
  });
  var newItem = doc.createElement('A');
  anchor.insertBefore(newItem, anchor.firstElementChild);
  var html = '';
  var shareFacebook = post.querySelector('.getshare-button-facebook');
  if (shareFacebook) {
    html += "\n                        <a class=\"-qQT3\" target=\"_blank\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareFacebook.href) + "\"\n                           tabIndex=\"0\">\n                            <div aria-labelledby=\"f2651ace72260d8 f2ddfaec4fe3b1c\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                    <div class=\"_NyRp\"><span aria-label=\"Compartir en Facebook\"\n                                                                 class=\"glyphsSpriteFacebook_circle__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                        id=\"f2651ace72260d8\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                            <div\n                                                class=\"_7UhW9   xLCgt       qyrsm          uL8Hv\">Compartir\n                                                en Facebook\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareFacebookMessenger = post.querySelector('.getshare-button-facebook-messenger');
  if (shareFacebookMessenger) {
    html += "\n                        <a class=\"-qQT3\" target=\"_blank\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareFacebookMessenger.href) + "\"\n                           tabIndex=\"0\">\n                        <div aria-labelledby=\"f1426a43f5147a f11e7bc503d54a4\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                <div class=\"_NyRp\"><span aria-label=\"Compartir en Messenger\"\n                                                             class=\"glyphsSpriteApp_messenger__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                    id=\"f1426a43f5147a\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                        <div class=\"_7UhW9   xLCgt       qyrsm          uL8Hv\">Compartir en\n                                            Messenger\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareWhatsapp = post.querySelector('.getshare-button-whatsapp');
  if (shareWhatsapp) {
    html += "\n                        <a class=\"-qQT3\" target=\"_blank\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareWhatsapp.href) + "\"\n                           tabIndex=\"0\">\n                        <div aria-labelledby=\"f376d666558f9dc f1b134c7b330a0c\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                <div class=\"_NyRp\"><span aria-label=\"Compartir en WhatsApp\"\n                                                             class=\"glyphsSpriteApp_whatsapp__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                    id=\"f376d666558f9dc\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                        <div class=\"_7UhW9   xLCgt       qyrsm          uL8Hv\">Compartir en\n                                            WhatsApp\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareTwitter = post.querySelector('.getshare-button-twitter');
  if (shareTwitter) {
    html += "\n                        <a class=\"-qQT3\" target=\"_blank\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareTwitter.href) + "\"\n                           tabIndex=\"0\">\n                        <div aria-labelledby=\"f3a2775acb29314 f121b5c4a7a7034\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                <div class=\"_NyRp\"><span aria-label=\"Compartir en Twitter\"\n                                                             class=\"glyphsSpriteApp_twitter__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                    id=\"f3a2775acb29314\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                        <div class=\"_7UhW9   xLCgt       qyrsm uL8Hv\">Compartir en\n                                            Twitter\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareTumblr = post.querySelector('.getshare-button-tumblr');
  if (shareTumblr) {
    html += "\n                        <a class=\"-qQT3\" target=\"_blank\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareTumblr.href) + "\"\n                           tabIndex=\"0\">\n                        <div aria-labelledby=\"f3a2775acb29314 f121b5c4a7a7034\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                <div class=\"_NyRp\"><span aria-label=\"Compartir en Tumblr\"\n                                                             class=\"glyphsSpriteNew_post__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                    id=\"f3a2775acb29314\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                        <div class=\"_7UhW9   xLCgt       qyrsm uL8Hv\">Compartir en\n                                            Tumblr\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareEmail = post.querySelector('.getshare-button-email');
  if (shareEmail) {
    html += "\n                        <a class=\"-qQT3 emailSharer\" target=\"_top\"\n                           href=\"" + (0, _htmlEntities.escapeHtml)(shareEmail.href) + "\"\n                           tabIndex=\"0\">\n                        <div aria-labelledby=\"f10efc358637eb f2dfcba5e104864\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                <div class=\"_NyRp\"><span aria-label=\"Compartir por correo electr\xF3nico\"\n                                                             class=\"glyphsSpriteMail__outline__24__grey_9 u-__7\"></span>\n                                    </div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                    id=\"f10efc358637eb\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4    fDxYl\">\n                                            <div\n                                                class=\"_7UhW9   xLCgt       qyrsm          uL8Hv\">Compartir\n                                            por correo electr\xF3nico\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>";
  }
  var shareCopyLink = post.querySelector('.NG_title_post a');
  if (shareCopyLink && shareCopyLink.href) {
    html += "                        <a class=\"-qQT3\" target=\"_top\"\n                           href=\"#\"\n                           tabIndex=\"0\">\n            <div aria-labelledby=\"f37539d5e8cef34 f26d884556604f4\"\n                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                <div\n                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                    <div class=\"_NyRp\"><span aria-label=\"Copiar enlace\"\n                                                 class=\"glyphsSpriteLink__outline__24__grey_9 u-__7\"></span></div>\n                </div>\n                <div\n                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                    <div\n                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                        id=\"f37539d5e8cef34\">\n                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4             fDxYl     \">\n                            <div class=\"_7UhW9   xLCgt       qyrsm          uL8Hv         copyLink\">Copiar enlace</div>\n                            <input type=\"text\" class=\"copyLinkText\" style=\"display:none\" value=\"" + (0, _htmlEntities.escapeHtml)(shareCopyLink.href) + "\"></input>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </a>";
  }
  newItem.outerHTML = html;
  if (shareEmail) {
    var newEmailSharer = anchor.querySelector('.emailSharer');
    if (newEmailSharer) newEmailSharer.onclick = shareEmail.onclick;
  }
  if (shareCopyLink) {
    var copyLinkSharer = anchor.querySelector('.copyLink');
    var copyText = anchor.querySelector('input.copyLinkText');
    if (copyLinkSharer && copyText) {
      copyLinkSharer.onclick = function () {
        copyText.style.display = '';
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        var ret = doc.execCommand("copy");
        (0, _log.cLog)("Return: ", ret);

        /* Alert the copied text */
        if (ret) {
          var tooltip = doc.createElement('div');
          tooltip.style.position = 'fixed';
          tooltip.style.bottom = '30px';
          tooltip.style.width = '70px';
          tooltip.style.left = '50%';
          tooltip.style.marginLeft = '-35px';
          tooltip.style.pointerEvents = 'none';
          tooltip.style.color = 'grey';
          tooltip.style.background = 'white';
          tooltip.style.zIndex = '999999999';
          tooltip.innerHTML = 'Copiado!';
          doc.body.appendChild(tooltip);
          setTimeout(function () {
            return tooltip.remove();
          }, 1000);
        }
        doc.defaultView.getSelection().removeAllRanges();
        copyText.style.display = 'none';
      };
    }
  }
};
var dismiss = function dismiss(e) {
  (0, _log.cLog)("DISMISS", _this, e, e.target);
  var target = e.target;
  if (target.matches('.xkuux,.xkuux *') && !target.matches('#f2366655318dbdc,#f2366655318dbdc *')) return;
  visible = false;
  doc.querySelector('.xkuux').style.transform = "translateY(100vh)";
  setTimeout(function () {
    return doc.querySelector('.RnEpo').style.display = 'none';
  }, 300);
  doc.body.removeEventListener("click", dismiss, false);
  doc.body.removeEventListener("tap", dismiss, false);
  enableScroll();
};
var show = function show(e) {
  (0, _log.cLog)("SHOW", _this, e, e && e.target);
  if (e && e.target && e.target.nodeName === 'A') return;
  visible = true;
  customizeSharers(e && e.target);
  doc.querySelector('.RnEpo').scrollBy(0, -10000);
  doc.querySelector('.RnEpo').style.display = 'block';
  doc.querySelector('.xkuux').style.transform = "translateY(" + calcTranslateYValue(430) + "px)";
  doc.querySelector('.RnEpo').scrollBy(0, -10000);
  setTimeout(function () {
    doc.body.addEventListener("click", dismiss, false);
    doc.body.addEventListener("tap", dismiss, false);
  }, 1);
};
function buildSharer(doc) {
  var css = "\n.-qQT3>div {display:flex}\nh1.m82CD {color: #262626}\n._NyRp {\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n    -ms-flex-align: center;\n    align-items: center;\n    height: 32px;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    width: 32px;\n    }\n    .y9v3U{color:#262626;color:rgba(var(--i1d,38,38,38),1);display:block}.cqXBL,.cqXBL:visited{color:#262626;color:rgba(var(--i1d,38,38,38),1)}.zV_Nj,.zV_Nj:visited{font-weight:600;color:#262626;color:rgba(var(--i1d,38,38,38),1)}.Nm9Fw{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-flex:1;-webkit-flex:1 1 auto;-ms-flex:1 1 auto;flex:1 1 auto;-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;white-space:pre}\n.FPmhX{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-left:5px;margin-left:-5px}a.FPmhX.MBL3Z{color:#262626;color:rgba(var(--i1d,38,38,38),1)}\n.ZUqME{-webkit-box-sizing:border-box;box-sizing:border-box}.pV7Qt{border:1px solid #dbdbdb;border:1px solid rgba(var(--b38,219,219,219),1)}._41V_T{border-radius:50%}._6Rvw2{border-radius:4px}.Sapc9{background-color:#0095f6;background-color:rgba(var(--d69,0,149,246),1)}._6YLdr{background-color:#e0f1ff;background-color:rgba(var(--fa7,224,241,255),1)}.tHaIX{background-color:#fafafa;background-color:rgba(var(--b3f,250,250,250),1)}.QOqBd{background-color:#efefef;background-color:rgba(var(--bb2,239,239,239),1)}.uKI5P{background-color:#ed4956;background-color:rgba(var(--c37,237,73,86),1)}.DPiy6{background-color:#fff;background-color:rgba(var(--d87,255,255,255),1)}.IhCmn{background-color:#262626;background-color:rgba(var(--i1d,38,38,38),1)}.wpHm3{background-color:#fff;background-color:rgba(var(--eca,255,255,255),1)}.QzzMF{display:block}.AC7dP{display:inline-block}.L84MX{display:none}.Zixx0{display:block;overflow:hidden;text-indent:110%;white-space:nowrap}.lKHVe{-webkit-align-content:flex-start;-ms-flex-line-pack:start;align-content:flex-start}.vvR1w{-webkit-align-content:flex-end;-ms-flex-line-pack:end;align-content:flex-end}.fXpnZ{-webkit-align-content:center;-ms-flex-line-pack:center;align-content:center}.yhAVL{-webkit-align-content:space-between;-ms-flex-line-pack:justify;align-content:space-between}.a65--{-webkit-align-content:space-around;-ms-flex-line-pack:distribute;align-content:space-around}.Igw0E{-webkit-align-content:stretch;-ms-flex-line-pack:stretch;align-content:stretch}._56XdI{-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start}.Xf6Yq{-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end}.rBNOH{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.g-fE_{-webkit-box-align:baseline;-webkit-align-items:baseline;-ms-flex-align:baseline;align-items:baseline}.IwRSH{-webkit-box-align:stretch;-webkit-align-items:stretch;-ms-flex-align:stretch;align-items:stretch}.c4MQN{-webkit-align-self:flex-start;-ms-flex-item-align:start;align-self:flex-start}.KB4CO{-webkit-align-self:flex-end;-ms-flex-item-align:end;align-self:flex-end}.pmxbr{-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.b8MSm{-webkit-align-self:baseline;-ms-flex-item-align:baseline;align-self:baseline}.G71rz{-webkit-align-self:stretch;-ms-flex-item-align:stretch;align-self:stretch}.ybXk5{-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row}.q0n74{-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-webkit-flex-direction:row-reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse}.j6NZI{-webkit-box-orient:vertical;-webkit-box-direction:reverse;-webkit-flex-direction:column-reverse;-ms-flex-direction:column-reverse;flex-direction:column-reverse}.eGOV_{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start}.hLiUi{-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end}.YBx95{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.CcYR1{-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between}.J0Xm8{-webkit-justify-content:space-around;-ms-flex-pack:distribute;justify-content:space-around}.vwCYk{-webkit-box-flex:1;-webkit-flex:1 1 auto;-ms-flex:1 1 auto;flex:1 1 auto;min-height:0;min-width:0;height:18px}._4EzTm{-webkit-box-flex:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto}.ui_ht{-webkit-box-flex:0;-webkit-flex:0 1 auto;-ms-flex:0 1 auto;flex:0 1 auto}.YlhBV{-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.pjcA_{margin-bottom:4px}.bkEs3{margin-bottom:8px}._22l1{margin-bottom:12px}.MGdpg{margin-bottom:16px}.oxOrt{margin-bottom:20px}.FBi-h{margin-bottom:24px}.a39_R{margin-bottom:28px}.qD5Mv{margin-bottom:32px}.aftyv{margin-bottom:36px}.f9hD0{margin-bottom:40px}.MGky5{margin-bottom:44px}._7J5l7{margin-bottom:48px}.KokQV{margin-bottom:52px}.bm-qU{margin-bottom:56px}.oaeHW{margin-bottom:60px}.U2erN{margin-bottom:64px}._7eH1b{margin-bottom:68px}.gL6fO{margin-bottom:auto}.WKY0a{margin-left:4px}.soMvl{margin-left:8px}.n4cjz{margin-left:12px}._5VUwz{margin-left:16px}.bPdm3{margin-left:20px}.XlcGs{margin-left:24px}.dE4iQ{margin-left:28px}.gT2s8{margin-left:32px}._6Nb0I{margin-left:36px}.CovQj{margin-left:40px}.K7QFQ{margin-left:44px}.Qjx67{margin-left:48px}.GsRgD{margin-left:52px}.auMjJ{margin-left:56px}.eYEtZ{margin-left:60px}.mTDe1{margin-left:64px}.M2CRh{margin-left:68px}.CIRqI{margin-left:auto}.ItkAi{margin-right:4px}.JI_ht{margin-right:8px}.yC0tu{margin-right:12px}.y2rAt{margin-right:16px}.BGYmY{margin-right:20px}.ZEe2i{margin-right:24px}.cb9w7{margin-right:28px}.ApndJ{margin-right:32px}._748V-{margin-right:36px}.jKUp7{margin-right:40px}._6wM3Z{margin-right:44px}.Z5VSw{margin-right:48px}.LHwVS{margin-right:52px}.TpD3c{margin-right:56px}.NNlRo{margin-right:60px}.YJVmG{margin-right:64px}.h_CCK{margin-right:68px}.IY_1_{margin-right:auto}.iHqQ7{margin-top:4px}.DhRcB{margin-top:8px}._49XvD{margin-top:12px}.aGBdT{margin-top:16px}.gKUEf{margin-top:20px}.kEKum{margin-top:24px}._55Ud{margin-top:28px}.dQ9Hi{margin-top:32px}.UU_bp{margin-top:36px}.yMvbc{margin-top:40px}.lKyay{margin-top:44px}.IM32b{margin-top:48px}.G00MQ{margin-top:52px}.KwoG5{margin-top:56px}.sn5rQ{margin-top:60px}.rVxZD{margin-top:64px}.aAhnZ{margin-top:68px}.AxUK4{margin-top:auto}.O1flK{bottom:0}.D8xaz{left:0}.fm1AK{position:absolute}._7JkPY{position:fixed}.NUiEW{position:relative}.TxciK{right:0}.yiMZG{top:0}.lDRO1{overflow:auto;-webkit-overflow-scrolling:touch}.i0EQd{overflow:hidden}.HNKpc{overflow:scroll;-webkit-overflow-scrolling:touch}._3g6ee{overflow-x:scroll;overflow-y:hidden;-webkit-overflow-scrolling:touch}._3wFWr{overflow-x:hidden;overflow-y:scroll;-webkit-overflow-scrolling:touch}.zQLcH{padding-left:4px;padding-right:4px}.lC6p0{padding-left:8px;padding-right:8px}.BI4qX{padding-left:12px;padding-right:12px}.XfCBB{padding-left:16px;padding-right:16px}.L-sTb{padding-left:20px;padding-right:20px}.T9mq-{padding-left:24px;padding-right:24px}.yV-Ex{padding-left:28px;padding-right:28px}.c420d{padding-left:32px;padding-right:32px}._69oMM{padding-left:36px;padding-right:36px}.pwoi_{padding-left:40px;padding-right:40px}._9Gu4M{padding-left:44px;padding-right:44px}.iNp2o{padding-left:48px;padding-right:48px}.XTCZH{padding-bottom:4px;padding-top:4px}.HVWg4{padding-bottom:8px;padding-top:8px}.qJPeX{padding-bottom:12px;padding-top:12px}.g6RW6{padding-bottom:16px;padding-top:16px}.HcJZg{padding-bottom:20px;padding-top:20px}.nGS-Y{padding-bottom:24px;padding-top:24px}.zPcO_{padding-bottom:28px;padding-top:28px}.D8UUo{padding-bottom:32px;padding-top:32px}.qJdj7{padding-bottom:36px;padding-top:36px}.xUzvG{padding-bottom:40px;padding-top:40px}.sKZwS{padding-bottom:44px;padding-top:44px}.PUBS-{padding-bottom:48px;padding-top:48px}\n.sqdOP{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:0 0;border:0;-webkit-box-sizing:border-box;box-sizing:border-box;cursor:pointer;display:block;font-weight:600;padding:5px 9px;text-align:center;text-transform:inherit;text-overflow:ellipsis;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:auto}.sqdOP:active{opacity:.7}.sqdOP[disabled],a.sqdOP[disabled]{pointer-events:none}.sqdOP[disabled]:not(.A086a){opacity:.3}.L3NKy,a.L3NKy,a.L3NKy:visited{border-radius:4px;color:#fff;color:rgba(var(--eca,255,255,255),1);position:relative}._4pI4F{width:100%}.sH_mn,a.sH_mn,a.sH_mn:visited{background-color:transparent;border:1px solid #ed4956;border:1px solid rgba(var(--i30,237,73,86),1);color:#ed4956;color:rgba(var(--i30,237,73,86),1)}.y3zKF:not(.yWX7d),a.y3zKF:not(.yWX7d),a.y3zKF:not(.yWX7d):visited{border:1px solid transparent;background-color:#0095f6;background-color:rgba(var(--d69,0,149,246),1)}.y3zKF:active:not(.yWX7d),a.y3zKF:active:not(.yWX7d),a.y3zKF:active:not(.yWX7d):visited{background-color:rgba(0,149,246,.7);background-color:rgba(var(--d69,0,149,246),.7);opacity:1}.y3zKF[disabled]:not(.yWX7d):not(.A086a),a.y3zKF[disabled]:not(.yWX7d):not(.A086a),a.y3zKF[disabled]:not(.yWX7d):not(.A086a):visited{background-color:rgba(0,149,246,.3);background-color:rgba(var(--d69,0,149,246),.3);opacity:1}._8A5w5,a._8A5w5,a._8A5w5:visited{background-color:transparent;border:1px solid #dbdbdb;border:1px solid rgba(var(--ca6,219,219,219),1);color:#262626;color:rgba(var(--f75,38,38,38),1)}.y1rQx,a.y1rQx,a.y1rQx:visited{background-color:transparent;border:1px solid #fff;border:1px solid rgba(var(--eca,255,255,255),1);color:#fff;color:rgba(var(--eca,255,255,255),1)}.cB_4K{padding:12px 18px}.yWX7d,.yWX7d:visited,a.yWX7d,a.yWX7d:visited{border:0;color:#0095f6;color:rgba(var(--d69,0,149,246),1);display:inline;padding:0;position:relative}.yWX7d.sH_mn,a.yWX7d.sH_mn,a.yWX7d.sH_mn:visited{color:#ed4956;color:rgba(var(--i30,237,73,86),1)}.yWX7d._8A5w5,a.yWX7d._8A5w5,a.yWX7d._8A5w5:visited{color:#262626;color:rgba(var(--f75,38,38,38),1)}.yWX7d.y1rQx,a.yWX7d.y1rQx,a.yWX7d.y1rQx:visited{color:#fff;color:rgba(var(--eca,255,255,255),1)}.ZIAjV{-webkit-user-select:auto;-moz-user-select:auto;-ms-user-select:auto;user-select:auto}.yWX7d.A086a,.A086a,a.yWX7d.A086a,a.A086a{color:transparent}\n.ekjoN,.sDN5V{--f52: 142,142,142;--h1d: 255,255,255;--de5: 255,255,255;--d69: 0,149,246;--b86: 88,195,34;--i30: 237,73,86;--d62: 255,255,255;--a72: 255,255,255;--ie3: 142,142,142;--c37: 237,73,86;--f24: 0,149,246;--jbb: 53,121,234;--eca: 255,255,255;--jb7: 0,0,0;--fa7: 224,241,255;--ba8: 168,168,168;--eac: 237,73,86}.sDN5V{--i1d: 38,38,38;--edc: 199,199,199;--f75: 38,38,38;--fe0: 0,55,107;--d87: 255,255,255;--b3f: 250,250,250;--bb2: 239,239,239;--f23: 255,255,255;--b38: 219,219,219;--b6a: 219,219,219;--ca6: 219,219,219;--cdd: 38,38,38;--e22: 199,199,199;--e62: 245,251,255;--b2f: 88,195,34;--c8c: 168,168,168;--ce3: 239,239,239;--jd9: 0,0,0;--j64: 54,54,54;--a97: 243,243,243;--d20: 38,38,38}.ekjoN{--i1d: 250,250,250;--edc: 115,115,115;--f75: 250,250,250;--fe0: 224,241,255;--d87: 0,0,0;--b3f: 18,18,18;--bb2: 38,38,38;--f23: 38,38,38;--b38: 38,38,38;--b6a: 54,54,54;--ca6: 54,54,54;--cdd: 250,250,250;--e22: 115,115,115;--e62: 0,149,246;--b2f: 55,166,0;--c8c: 85,85,85;--ce3: 38,38,38;--jd9: 255,255,255;--j64: 219,219,219;--a97: 38,38,38;--d20: 250,250,250}\n@-webkit-keyframes IGCoreSpinnerSpin8{0%{-webkit-transform:rotate(180deg);transform:rotate(180deg)}to{-webkit-transform:rotate(540deg);transform:rotate(540deg)}}@keyframes IGCoreSpinnerSpin8{0%{-webkit-transform:rotate(180deg);transform:rotate(180deg)}to{-webkit-transform:rotate(540deg);transform:rotate(540deg)}}@-webkit-keyframes IGCoreSpinnerSpin12{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes IGCoreSpinnerSpin12{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.FSiF6{-webkit-animation:IGCoreSpinnerSpin8 .8s steps(8) infinite;animation:IGCoreSpinnerSpin8 .8s steps(8) infinite}.By4nA{-webkit-animation:IGCoreSpinnerSpin12 1.2s steps(12) infinite;animation:IGCoreSpinnerSpin12 1.2s steps(12) infinite}.By4nA.ZyL7E,.FSiF6.ZyL7E{-webkit-animation:none;animation:none}._9qQ0O{position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}\n.FuWoR{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background:0 0;border-radius:50%;border-style:solid;-webkit-box-sizing:border-box;box-sizing:border-box;display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;position:relative}.-wdIA{border-color:#262626}.j44N4{border-color:#dbdbdb;border-color:rgba(var(--b6a,219,219,219),1)}.zUbsF{border-color:#4f67b0}.Bww6x{border-color:#fff}.zlwcS,.x7xX2{border-width:1px}.A2kdl{border-width:2px}@media (-webkit-min-device-pixel-ratio:2),(min-resolution:2dppx){.x7xX2{border:0}.x7xX2::after{border-radius:50%;border:3px solid;-webkit-box-sizing:border-box;box-sizing:border-box;content:'';height:200%;left:0;position:absolute;top:0;-webkit-transform-origin:top left;transform-origin:top left;-webkit-transform:scale(.5);transform:scale(.5);width:200%}.j44N4.x7xX2::after{border-color:#dbdbdb;border-color:rgba(var(--b6a,219,219,219),1)}.-wdIA.x7xX2::after{border-color:#262626}.zUbsF.x7xX2::after{border-color:#4f67b0}.Bww6x.x7xX2::after{border-color:#fff}}\n.u-__7{display:block}\n.wellbeingSpriteTwo_fac_code,.wellbeingSpriteTwo_fac_lock,.wellbeingSpriteTwo_fac_on,.wellbeingSpriteTwo_fac_password,.wellbeingSpriteTwo_fac_sync{background-image:url(https://users.ampliffy.com/img/sharer/sprite_wellbeing_6af9c5060ebc.png/6af9c5060ebc.png)}.wellbeingSpriteTwo_fac_code{background-repeat:no-repeat;background-position:-92px 0;height:48px;width:48px}.wellbeingSpriteTwo_fac_lock,.wellbeingSpriteTwo_fac_on{background-repeat:no-repeat;background-position:0 0;height:48px;width:90px}.wellbeingSpriteTwo_fac_on{background-position:-92px -50px;width:48px}.wellbeingSpriteTwo_fac_password,.wellbeingSpriteTwo_fac_sync{background-repeat:no-repeat;background-position:0 -50px;height:66px;width:48px}.wellbeingSpriteTwo_fac_sync{background-position:-142px 0;height:48px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.wellbeingSpriteTwo_fac_code,.wellbeingSpriteTwo_fac_lock,.wellbeingSpriteTwo_fac_on,.wellbeingSpriteTwo_fac_password,.wellbeingSpriteTwo_fac_sync{background-image:url(https://users.ampliffy.com/img/sharer/sprite_wellbeing_2x_c0241d394c59.png/c0241d394c59.png)}.wellbeingSpriteTwo_fac_code{background-size:188px 115px;background-position:-91px 0}.wellbeingSpriteTwo_fac_lock,.wellbeingSpriteTwo_fac_on{background-size:188px 115px;background-position:0 0}.wellbeingSpriteTwo_fac_on{background-position:-91px -49px}.wellbeingSpriteTwo_fac_password{background-size:188px 115px;background-position:0 -49px}.wellbeingSpriteTwo_fac_sync{background-size:188px 115px;background-position:-140px 0}}\n.storiesSpriteChisel__filled__44,.storiesSpriteChisel__outline__44,.storiesSpriteDownload__outline__44,.storiesSpriteDrawing_tools__filled__44,.storiesSpriteEraser__filled__44,.storiesSpriteEraser__outline__44,.storiesSpriteMagic__filled__44,.storiesSpriteMagic__outline__44,.storiesSpriteMarker__filled__44,.storiesSpriteMarker__outline__44,.storiesSpriteNew_story__outline__24__grey_0,.storiesSpriteSticker__outline__44,.storiesSpriteText__filled__44,.storiesSpriteX__outline__44{background-image:url(https://users.ampliffy.com/img/sharer/sprite_stories_ce36b733f814.png/ce36b733f814.png)}.storiesSpriteChisel__filled__44,.storiesSpriteChisel__outline__44{background-repeat:no-repeat;background-position:0 0;height:44px;width:44px}.storiesSpriteChisel__outline__44{background-position:-46px 0}.storiesSpriteDownload__outline__44,.storiesSpriteDrawing_tools__filled__44{background-repeat:no-repeat;background-position:0 -46px;height:44px;width:44px}.storiesSpriteDrawing_tools__filled__44{background-position:-46px -46px}.storiesSpriteEraser__filled__44,.storiesSpriteEraser__outline__44{background-repeat:no-repeat;background-position:-92px 0;height:44px;width:44px}.storiesSpriteEraser__outline__44{background-position:-92px -46px}.storiesSpriteMagic__filled__44,.storiesSpriteMagic__outline__44{background-repeat:no-repeat;background-position:0 -92px;height:44px;width:44px}.storiesSpriteMagic__outline__44{background-position:-46px -92px}.storiesSpriteMarker__filled__44,.storiesSpriteMarker__outline__44{background-repeat:no-repeat;background-position:-92px -92px;height:44px;width:44px}.storiesSpriteMarker__outline__44{background-position:-138px 0}.storiesSpriteNew_story__outline__24__grey_0{background-repeat:no-repeat;background-position:-46px -138px;height:24px;width:24px}.storiesSpriteSticker__outline__44{background-repeat:no-repeat;background-position:-138px -46px;height:44px;width:44px}.storiesSpriteText__filled__44,.storiesSpriteX__outline__44{background-repeat:no-repeat;background-position:-138px -92px;height:44px;width:44px}.storiesSpriteX__outline__44{background-position:0 -138px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.storiesSpriteChisel__filled__44,.storiesSpriteChisel__outline__44,.storiesSpriteDownload__outline__44,.storiesSpriteDrawing_tools__filled__44,.storiesSpriteEraser__filled__44,.storiesSpriteEraser__outline__44,.storiesSpriteMagic__filled__44,.storiesSpriteMagic__outline__44,.storiesSpriteMarker__filled__44,.storiesSpriteMarker__outline__44,.storiesSpriteNew_story__outline__24__grey_0,.storiesSpriteSticker__outline__44,.storiesSpriteText__filled__44,.storiesSpriteX__outline__44{background-image:url(https://users.ampliffy.com/img/sharer/sprite_stories_2x_5b2f74f4bf86.png/5b2f74f4bf86.png)}.storiesSpriteChisel__filled__44{background-size:179px 179px;background-position:0 0}.storiesSpriteChisel__outline__44{background-size:179px 179px;background-position:-45px 0}.storiesSpriteDownload__outline__44{background-size:179px 179px;background-position:0 -45px}.storiesSpriteDrawing_tools__filled__44{background-size:179px 179px;background-position:-45px -45px}.storiesSpriteEraser__filled__44{background-size:179px 179px;background-position:-90px 0}.storiesSpriteEraser__outline__44{background-size:179px 179px;background-position:-90px -45px}.storiesSpriteMagic__filled__44{background-size:179px 179px;background-position:0 -90px}.storiesSpriteMagic__outline__44{background-size:179px 179px;background-position:-45px -90px}.storiesSpriteMarker__filled__44{background-size:179px 179px;background-position:-90px -90px}.storiesSpriteMarker__outline__44{background-size:179px 179px;background-position:-135px 0}.storiesSpriteNew_story__outline__24__grey_0{background-size:179px 179px;background-position:-45px -135px}.storiesSpriteSticker__outline__44{background-size:179px 179px;background-position:-135px -45px}.storiesSpriteText__filled__44{background-size:179px 179px;background-position:-135px -90px}.storiesSpriteX__outline__44{background-size:179px 179px;background-position:0 -135px}}\n.nametagSpriteNT_Contrast,.nametagSpriteNT_Corners,.nametagSpriteNT_Pixels{background-image:url(https://users.ampliffy.com/img/sharer/sprite_nametag_ff60b6c57870.png/ff60b6c57870.png);background-repeat:no-repeat;background-position:0 0;height:120px;width:120px}.nametagSpriteNT_Corners,.nametagSpriteNT_Pixels{background-position:-122px 0}.nametagSpriteNT_Pixels{background-position:0 -122px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.nametagSpriteNT_Contrast,.nametagSpriteNT_Corners,.nametagSpriteNT_Pixels{background-image:url(https://users.ampliffy.com/img/sharer/sprite_nametag_2x_69c195e9ff3c.png/69c195e9ff3c.png)}.nametagSpriteNT_Contrast{background-size:241px 241px;background-position:0 0}.nametagSpriteNT_Corners,.nametagSpriteNT_Pixels{background-size:241px 241px;background-position:-121px 0}.nametagSpriteNT_Pixels{background-position:0 -121px}}\n.mediatypesSpriteCarousel__filled__32,.mediatypesSpriteIgtv__filled__32,.mediatypesSpriteVideo__filled__32{background-image:url(https://users.ampliffy.com/img/sharer/sprite_mediatypes_65c15d7731ea.png/65c15d7731ea.png)}.mediatypesSpriteCarousel__filled__32{background-repeat:no-repeat;background-position:0 0;height:32px;width:32px}.mediatypesSpriteIgtv__filled__32,.mediatypesSpriteVideo__filled__32{background-repeat:no-repeat;background-position:-34px 0;height:32px;width:32px}.mediatypesSpriteVideo__filled__32{background-position:0 -34px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.mediatypesSpriteCarousel__filled__32,.mediatypesSpriteIgtv__filled__32,.mediatypesSpriteVideo__filled__32{background-image:url(https://users.ampliffy.com/img/sharer/sprite_mediatypes_2x_3be21f338c88.png/3be21f338c88.png)}.mediatypesSpriteCarousel__filled__32{background-size:65px 65px;background-position:0 0}.mediatypesSpriteIgtv__filled__32{background-size:65px 65px;background-position:-33px 0}.mediatypesSpriteVideo__filled__32{background-size:65px 65px;background-position:0 -33px}}\n.loggedoutSpriteComment_Contextual_Login,.loggedoutSpriteFollow_Contextual_Login,.loggedoutSpriteGlyph_Contextual_Login,.loggedoutSpriteLike_Contextual_Login,.loggedoutSpriteSave_Contextual_Login{background-image:url(https://users.ampliffy.com/img/sharer/sprite_loggedout_995ea10178c7.png/995ea10178c7.png)}.loggedoutSpriteComment_Contextual_Login,.loggedoutSpriteFollow_Contextual_Login{background-repeat:no-repeat;background-position:-46px 0;height:36px;width:36px}.loggedoutSpriteFollow_Contextual_Login{background-position:0 -46px}.loggedoutSpriteGlyph_Contextual_Login{background-repeat:no-repeat;background-position:0 0;height:44px;width:44px}.loggedoutSpriteLike_Contextual_Login,.loggedoutSpriteSave_Contextual_Login{background-repeat:no-repeat;background-position:-38px -46px;height:36px;width:36px}.loggedoutSpriteSave_Contextual_Login{background-position:-84px 0}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.loggedoutSpriteComment_Contextual_Login,.loggedoutSpriteFollow_Contextual_Login,.loggedoutSpriteGlyph_Contextual_Login,.loggedoutSpriteLike_Contextual_Login,.loggedoutSpriteSave_Contextual_Login{background-image:url(https://users.ampliffy.com/img/sharer/sprite_loggedout_2x_839e62b1415f.png/839e62b1415f.png)}.loggedoutSpriteComment_Contextual_Login{background-size:118px 81px;background-position:-45px 0}.loggedoutSpriteFollow_Contextual_Login{background-size:118px 81px;background-position:0 -45px}.loggedoutSpriteGlyph_Contextual_Login{background-size:118px 81px;background-position:0 0}.loggedoutSpriteLike_Contextual_Login{background-size:118px 81px;background-position:-37px -45px}.loggedoutSpriteSave_Contextual_Login{background-size:118px 81px;background-position:-82px 0}}\n.glyphsSpriteAdd__outline__24__blue_5,.glyphsSpriteAdd__outline__24__grey_9,.glyphsSpriteAdd_friend__outline__96,.glyphsSpriteApp_Icon_28,.glyphsSpriteApp_Icon_30,.glyphsSpriteApp_Icon_36,.glyphsSpriteApp_Icon_45,.glyphsSpriteApp_Icon_60,.glyphsSpriteApp_Icon_IGTV_44,.glyphsSpriteApp_instagram__outline__24__grey_9,.glyphsSpriteApp_messenger__outline__24__grey_9,.glyphsSpriteApp_twitter__outline__24__grey_9,.glyphsSpriteApp_whatsapp__outline__24__grey_9,.glyphsSpriteBirthday_cake,.glyphsSpriteBrowser_Icon_Chrome_28,.glyphsSpriteBrowser_Icon_Firefox_28,.glyphsSpriteBrowser_Icon_Generic_28,.glyphsSpriteBrowser_Icon_Safari_28,.glyphsSpriteCall__outline__24__grey_9,.glyphsSpriteCamera__outline__24__grey_9,.glyphsSpriteChevron_circle_shadow_left,.glyphsSpriteChevron_circle_shadow_right,.glyphsSpriteChevron_down__outline__24__grey_5,.glyphsSpriteChevron_down__outline__24__grey_9,.glyphsSpriteChevron_left__outline__24__grey_9,.glyphsSpriteChevron_right__outline__24__grey_5,.glyphsSpriteChevron_up__outline__24__grey_5,.glyphsSpriteChevron_up__outline__24__grey_9,.glyphsSpriteCircle__outline__24__grey_2,.glyphsSpriteCircle_add__outline__24__grey_5,.glyphsSpriteCircle_add__outline__24__grey_9,.glyphsSpriteCircle_check__filled__24__blue_5,.glyphsSpriteCircle_check__filled__24__green_5,.glyphsSpriteCircle_check__outline__24__blue_5,.glyphsSpriteComment__filled__16__white,.glyphsSpriteComment__outline__24__grey_9,.glyphsSpriteContact_import,.glyphsSpriteContact_import_sm,.glyphsSpriteDelete__outline__24__grey_0,.glyphsSpriteDirect__outline__24__grey_0,.glyphsSpriteDirect__outline__24__grey_9,.glyphsSpriteDirect__outline__96,.glyphsSpriteDownload_2FAC,.glyphsSpriteEmail_confirm,.glyphsSpriteError__outline__24__grey_9,.glyphsSpriteError__outline__96,.glyphsSpriteError_glyph_grey,.glyphsSpriteFB_Logo,.glyphsSpriteFacebook_circle__filled__12__blue_5,.glyphsSpriteFacebook_circle__outline__24__grey_9,.glyphsSpriteFacebook_circle_filled_24,.glyphsSpriteFb_brand_center_grey,.glyphsSpriteForward__outline__24__grey_9,.glyphsSpriteFriend_Follow,.glyphsSpriteGlyph_chevron_right,.glyphsSpriteGlyph_circle_star,.glyphsSpriteGlyph_eye_off,.glyphsSpriteGlyph_volume_off,.glyphsSpriteGlyph_warning,.glyphsSpriteGrey_Close,.glyphsSpriteHalf_star_black,.glyphsSpriteHalf_star_white,.glyphsSpriteHashtag__outline__24__grey_9,.glyphsSpriteHeart__filled__16__grey_9,.glyphsSpriteHeart__filled__16__white,.glyphsSpriteHeart__filled__24__grey_9,.glyphsSpriteHeart__filled__24__red_5,.glyphsSpriteHeart__outline__24__grey_9,.glyphsSpriteHome__filled__24__grey_9,.glyphsSpriteHome__outline__24__grey_9,.glyphsSpriteIG_Lite_Direct_Variant_01,.glyphsSpriteIgtv__outline__24__blue_5,.glyphsSpriteIgtv__outline__24__grey_5,.glyphsSpriteInfo__filled__16__grey_9,.glyphsSpriteInput_clear,.glyphsSpriteLink__outline__24__grey_9,.glyphsSpriteLite_app_icon,.glyphsSpriteLocation__outline__24__grey_9,.glyphsSpriteLock__outline__24__grey_9,.glyphsSpriteLock__outline__96,.glyphsSpriteLogged_Out_QP_Glyph,.glyphsSpriteMail__outline__24__grey_9,.glyphsSpriteMenu__outline__24__grey_9,.glyphsSpriteMore_horizontal__filled__24__grey_0,.glyphsSpriteMore_horizontal__outline__16__grey_5,.glyphsSpriteMore_horizontal__outline__24__grey_5,.glyphsSpriteMore_horizontal__outline__24__grey_9,.glyphsSpriteNew_feed_activity,.glyphsSpriteNew_post__outline__24__grey_9,.glyphsSpriteNews_off_outline,.glyphsSpriteNews_off_outline_red,.glyphsSpritePaging_chevron,.glyphsSpritePhone_confirm,.glyphsSpritePhoto_grid__outline__24__blue_5,.glyphsSpritePhoto_grid__outline__24__grey_5,.glyphsSpritePhoto_list__outline__24__blue_5,.glyphsSpritePhoto_list__outline__24__grey_5,.glyphsSpritePlay__filled__16__grey_9,.glyphsSpriteSave__filled__24__grey_9,.glyphsSpriteSave__outline__24__blue_5,.glyphsSpriteSave__outline__24__grey_5,.glyphsSpriteSave__outline__24__grey_9,.glyphsSpriteSearch,.glyphsSpriteSearch__filled__24__grey_9,.glyphsSpriteSearch__outline__24__grey_9,.glyphsSpriteSettings__outline__24__grey_9,.glyphsSpriteShare__outline__24__grey_9,.glyphsSpriteStar_black,.glyphsSpriteStar_filled_24,.glyphsSpriteStar_filled_white_24,.glyphsSpriteStar_half_filled_24,.glyphsSpriteStar_half_filled_24_white,.glyphsSpriteStar_white,.glyphsSpriteStory__outline__24__grey_9,.glyphsSpriteTag_up__filled__16__white,.glyphsSpriteTag_up__outline__24__blue_5,.glyphsSpriteTag_up__outline__24__grey_5,.glyphsSpriteUser__filled__16__white,.glyphsSpriteUser__filled__24__grey_0,.glyphsSpriteUser__filled__24__grey_9,.glyphsSpriteUser__outline__24__grey_9,.glyphsSpriteUser_follow__filled__24__grey_9,.glyphsSpriteUser_follow__outline__24__grey_9,.glyphsSpriteUsers__outline__24__grey_9,.glyphsSpriteVerified_small,.glyphsSpriteVideo_chat__outline__24__grey_9,.glyphsSpriteVolume__outline__44,.glyphsSpriteVolume_off__filled__44,.glyphsSpriteWhite_Close,.glyphsSpriteX__filled__12__white,.glyphsSpriteX__outline__24__grey_9{background-image:url(https://users.ampliffy.com/img/sharer/sprite_glyphs_c7c7dd31199e.png/c7c7dd31199e.png)}.glyphsSpriteAdd__outline__24__blue_5,.glyphsSpriteAdd__outline__24__grey_9{background-repeat:no-repeat;background-position:-232px -298px;height:24px;width:24px}.glyphsSpriteAdd__outline__24__grey_9{background-position:-258px -298px}.glyphsSpriteAdd_friend__outline__96,.glyphsSpriteApp_Icon_28{background-repeat:no-repeat;background-position:-146px 0;height:96px;width:96px}.glyphsSpriteApp_Icon_28{background-position:-404px -258px;height:28px;width:28px}.glyphsSpriteApp_Icon_30,.glyphsSpriteApp_Icon_36{background-repeat:no-repeat;background-position:-404px -226px;height:30px;width:30px}.glyphsSpriteApp_Icon_36{background-position:-92px -298px;height:36px;width:36px}.glyphsSpriteApp_Icon_45,.glyphsSpriteApp_Icon_60{background-repeat:no-repeat;background-position:-94px -148px;height:45px;width:45px}.glyphsSpriteApp_Icon_60{background-position:-342px -226px;height:60px;width:60px}.glyphsSpriteApp_Icon_IGTV_44{background-repeat:no-repeat;background-position:-279px -226px;height:44px;width:44px}.glyphsSpriteApp_instagram__outline__24__grey_9{background-repeat:no-repeat;background-position:-284px -298px;height:24px;width:24px}.glyphsSpriteApp_messenger__outline__24__grey_9,.glyphsSpriteApp_twitter__outline__24__grey_9{background-repeat:no-repeat;background-position:-310px -298px;height:24px;width:24px}.glyphsSpriteApp_twitter__outline__24__grey_9{background-position:-336px -298px}.glyphsSpriteApp_whatsapp__outline__24__grey_9,.glyphsSpriteBirthday_cake{background-repeat:no-repeat;background-position:-362px -298px;height:24px;width:24px}.glyphsSpriteBirthday_cake{background-position:0 0;height:96px;width:144px}.glyphsSpriteBrowser_Icon_Chrome_28,.glyphsSpriteBrowser_Icon_Firefox_28{background-repeat:no-repeat;background-position:-146px -196px;height:28px;width:28px}.glyphsSpriteBrowser_Icon_Firefox_28{background-position:-176px -196px}.glyphsSpriteBrowser_Icon_Generic_28,.glyphsSpriteBrowser_Icon_Safari_28{background-repeat:no-repeat;background-position:-206px -196px;height:28px;width:28px}.glyphsSpriteBrowser_Icon_Safari_28{background-position:-94px -195px}.glyphsSpriteCall__outline__24__grey_9,.glyphsSpriteCamera__outline__24__grey_9{background-repeat:no-repeat;background-position:-388px -298px;height:24px;width:24px}.glyphsSpriteCamera__outline__24__grey_9{background-position:0 -344px}.glyphsSpriteChevron_circle_shadow_left,.glyphsSpriteChevron_circle_shadow_right{background-repeat:no-repeat;background-position:-185px -226px;height:45px;width:45px}.glyphsSpriteChevron_circle_shadow_right{background-position:-232px -226px}.glyphsSpriteChevron_down__outline__24__grey_5,.glyphsSpriteChevron_down__outline__24__grey_9{background-repeat:no-repeat;background-position:-26px -344px;height:24px;width:24px}.glyphsSpriteChevron_down__outline__24__grey_9{background-position:-52px -344px}.glyphsSpriteChevron_left__outline__24__grey_9,.glyphsSpriteChevron_right__outline__24__grey_5{background-repeat:no-repeat;background-position:-78px -344px;height:24px;width:24px}.glyphsSpriteChevron_right__outline__24__grey_5{background-position:-104px -344px}.glyphsSpriteChevron_up__outline__24__grey_5,.glyphsSpriteChevron_up__outline__24__grey_9{background-repeat:no-repeat;background-position:-130px -344px;height:24px;width:24px}.glyphsSpriteChevron_up__outline__24__grey_9{background-position:-156px -344px}.glyphsSpriteCircle__outline__24__grey_2,.glyphsSpriteCircle_add__outline__24__grey_5{background-repeat:no-repeat;background-position:-182px -344px;height:24px;width:24px}.glyphsSpriteCircle_add__outline__24__grey_5{background-position:-208px -344px}.glyphsSpriteCircle_add__outline__24__grey_9,.glyphsSpriteCircle_check__filled__24__blue_5{background-repeat:no-repeat;background-position:-234px -344px;height:24px;width:24px}.glyphsSpriteCircle_check__filled__24__blue_5{background-position:-260px -344px}.glyphsSpriteCircle_check__filled__24__green_5,.glyphsSpriteCircle_check__outline__24__blue_5{background-repeat:no-repeat;background-position:-286px -344px;height:24px;width:24px}.glyphsSpriteCircle_check__outline__24__blue_5{background-position:-312px -344px}.glyphsSpriteComment__filled__16__white{background-repeat:no-repeat;background-position:-416px -74px;height:16px;width:16px}.glyphsSpriteComment__outline__24__grey_9{background-repeat:no-repeat;background-position:-338px -344px;height:24px;width:24px}.glyphsSpriteContact_import_sm{background-repeat:no-repeat;background-position:-408px -182px;height:28px;width:23px}.glyphsSpriteContact_import{background-repeat:no-repeat;background-position:-408px -148px;height:32px;width:25px}.glyphsSpriteDelete__outline__24__grey_0{background-repeat:no-repeat;background-position:-364px -344px;height:24px;width:24px}.glyphsSpriteDirect__outline__24__grey_0,.glyphsSpriteDirect__outline__24__grey_9{background-repeat:no-repeat;background-position:-390px -344px;height:24px;width:24px}.glyphsSpriteDirect__outline__24__grey_9{background-position:0 -370px}.glyphsSpriteDirect__outline__96{background-repeat:no-repeat;background-position:-146px -98px;height:96px;width:96px}.glyphsSpriteDownload_2FAC,.glyphsSpriteEmail_confirm{background-repeat:no-repeat;background-position:0 -98px;height:126px;width:92px}.glyphsSpriteEmail_confirm{background-position:-342px 0;height:72px}.glyphsSpriteError__outline__24__grey_9{background-repeat:no-repeat;background-position:-26px -370px;height:24px;width:24px}.glyphsSpriteError__outline__96{background-repeat:no-repeat;background-position:-244px 0;height:96px;width:96px}.glyphsSpriteError_glyph_grey{background-repeat:no-repeat;background-position:-52px -370px;height:24px;width:24px}.glyphsSpriteFacebook_circle__filled__12__blue_5{background-repeat:no-repeat;background-position:-328px -196px;height:12px;width:12px}.glyphsSpriteFacebook_circle__outline__24__grey_9,.glyphsSpriteFacebook_circle_filled_24{background-repeat:no-repeat;background-position:-78px -370px;height:24px;width:24px}.glyphsSpriteFacebook_circle_filled_24{background-position:-104px -370px}.glyphsSpriteFB_Logo,.glyphsSpriteFb_brand_center_grey{background-repeat:no-repeat;background-position:-244px -196px;height:28px;width:82px}.glyphsSpriteFB_Logo{background-position:-416px -92px;height:16px;width:16px}.glyphsSpriteForward__outline__24__grey_9,.glyphsSpriteFriend_Follow{background-repeat:no-repeat;background-position:-130px -370px;height:24px;width:24px}.glyphsSpriteFriend_Follow{background-position:-408px -212px;height:12px}.glyphsSpriteGlyph_chevron_right{background-repeat:no-repeat;background-position:-36px -422px;height:13px;width:8px}.glyphsSpriteGlyph_circle_star,.glyphsSpriteGlyph_eye_off{background-repeat:no-repeat;background-position:-94px -98px;height:48px;width:48px}.glyphsSpriteGlyph_eye_off{background-position:-130px -298px;height:32px;width:32px}.glyphsSpriteGlyph_volume_off{background-repeat:no-repeat;background-position:-328px -210px;height:12px;width:12px}.glyphsSpriteGlyph_warning,.glyphsSpriteGrey_Close{background-repeat:no-repeat;background-position:-416px -110px;height:16px;width:16px}.glyphsSpriteGrey_Close{background-position:-185px -273px;height:9px;width:9px}.glyphsSpriteHalf_star_black,.glyphsSpriteHalf_star_white{background-repeat:no-repeat;background-position:-325px -226px;height:12px;width:12px}.glyphsSpriteHalf_star_white{background-position:-325px -240px}.glyphsSpriteHashtag__outline__24__grey_9{background-repeat:no-repeat;background-position:-156px -370px;height:24px;width:24px}.glyphsSpriteHeart__filled__16__grey_9,.glyphsSpriteHeart__filled__16__white{background-repeat:no-repeat;background-position:-416px -128px;height:16px;width:16px}.glyphsSpriteHeart__filled__16__white{background-position:-124px -195px}.glyphsSpriteHeart__filled__24__grey_9{background-repeat:no-repeat;background-position:-182px -370px;height:24px;width:24px}.glyphsSpriteHeart__filled__24__red_5,.glyphsSpriteHeart__outline__24__grey_9{background-repeat:no-repeat;background-position:-208px -370px;height:24px;width:24px}.glyphsSpriteHeart__outline__24__grey_9{background-position:-234px -370px}.glyphsSpriteHome__filled__24__grey_9,.glyphsSpriteHome__outline__24__grey_9{background-repeat:no-repeat;background-position:-260px -370px;height:24px;width:24px}.glyphsSpriteHome__outline__24__grey_9{background-position:-286px -370px}.glyphsSpriteIG_Lite_Direct_Variant_01{background-repeat:no-repeat;background-position:0 -226px;height:70px;width:125px}.glyphsSpriteIgtv__outline__24__blue_5,.glyphsSpriteIgtv__outline__24__grey_5{background-repeat:no-repeat;background-position:-312px -370px;height:24px;width:24px}.glyphsSpriteIgtv__outline__24__grey_5{background-position:-338px -370px}.glyphsSpriteInfo__filled__16__grey_9,.glyphsSpriteInput_clear{background-repeat:no-repeat;background-position:-414px -298px;height:16px;width:16px}.glyphsSpriteInput_clear{background-position:-436px -390px;height:20px;width:20px}.glyphsSpriteLink__outline__24__grey_9,.glyphsSpriteLite_app_icon{background-repeat:no-repeat;background-position:-364px -370px;height:24px;width:24px}.glyphsSpriteLite_app_icon{background-position:-342px -74px;height:72px;width:72px}.glyphsSpriteLocation__outline__24__grey_9,.glyphsSpriteLock__outline__24__grey_9{background-repeat:no-repeat;background-position:-390px -370px;height:24px;width:24px}.glyphsSpriteLock__outline__24__grey_9{background-position:0 -396px}.glyphsSpriteLock__outline__96{background-repeat:no-repeat;background-position:-244px -98px;height:96px;width:96px}.glyphsSpriteLogged_Out_QP_Glyph{background-repeat:no-repeat;background-position:-127px -226px;height:56px;width:56px}.glyphsSpriteMail__outline__24__grey_9{background-repeat:no-repeat;background-position:-26px -396px;height:24px;width:24px}.glyphsSpriteMenu__outline__24__grey_9,.glyphsSpriteMore_horizontal__filled__24__grey_0{background-repeat:no-repeat;background-position:-52px -396px;height:24px;width:24px}.glyphsSpriteMore_horizontal__filled__24__grey_0{background-position:-78px -396px}.glyphsSpriteMore_horizontal__outline__16__grey_5{background-repeat:no-repeat;background-position:-416px -344px;height:16px;width:16px}.glyphsSpriteMore_horizontal__outline__24__grey_5,.glyphsSpriteMore_horizontal__outline__24__grey_9{background-repeat:no-repeat;background-position:-104px -396px;height:24px;width:24px}.glyphsSpriteMore_horizontal__outline__24__grey_9{background-position:-130px -396px}.glyphsSpriteNew_feed_activity{background-repeat:no-repeat;background-position:-416px -370px;height:16px;width:16px}.glyphsSpriteNew_post__outline__24__grey_9{background-repeat:no-repeat;background-position:-156px -396px;height:24px;width:24px}.glyphsSpriteNews_off_outline,.glyphsSpriteNews_off_outline_red{background-repeat:no-repeat;background-position:-164px -298px;height:32px;width:32px}.glyphsSpriteNews_off_outline{background-position:-198px -298px}.glyphsSpritePaging_chevron,.glyphsSpritePhone_confirm{background-repeat:no-repeat;background-position:-182px -396px;height:24px;width:24px}.glyphsSpritePhone_confirm{background-position:-342px -148px;height:76px;width:64px}.glyphsSpritePhoto_grid__outline__24__blue_5,.glyphsSpritePhoto_grid__outline__24__grey_5{background-repeat:no-repeat;background-position:-208px -396px;height:24px;width:24px}.glyphsSpritePhoto_grid__outline__24__grey_5{background-position:-234px -396px}.glyphsSpritePhoto_list__outline__24__blue_5,.glyphsSpritePhoto_list__outline__24__grey_5{background-repeat:no-repeat;background-position:-260px -396px;height:24px;width:24px}.glyphsSpritePhoto_list__outline__24__grey_5{background-position:-286px -396px}.glyphsSpritePlay__filled__16__grey_9{background-repeat:no-repeat;background-position:-416px -396px;height:16px;width:16px}.glyphsSpriteSave__filled__24__grey_9{background-repeat:no-repeat;background-position:-312px -396px;height:24px;width:24px}.glyphsSpriteSave__outline__24__blue_5,.glyphsSpriteSave__outline__24__grey_5{background-repeat:no-repeat;background-position:-338px -396px;height:24px;width:24px}.glyphsSpriteSave__outline__24__grey_5{background-position:-364px -396px}.glyphsSpriteSave__outline__24__grey_9,.glyphsSpriteSearch__filled__24__grey_9{background-repeat:no-repeat;background-position:-390px -396px;height:24px;width:24px}.glyphsSpriteSearch__filled__24__grey_9{background-position:-436px 0}.glyphsSpriteSearch,.glyphsSpriteSearch__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -26px;height:24px;width:24px}.glyphsSpriteSearch{background-position:-124px -213px;height:10px;width:10px}.glyphsSpriteSettings__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -52px;height:24px;width:24px}.glyphsSpriteShare__outline__24__grey_9,.glyphsSpriteStar_black{background-repeat:no-repeat;background-position:-436px -78px;height:24px;width:24px}.glyphsSpriteStar_black{background-position:-325px -254px;height:12px;width:12px}.glyphsSpriteStar_filled_24,.glyphsSpriteStar_filled_white_24{background-repeat:no-repeat;background-position:-127px -284px;height:12px;width:12px}.glyphsSpriteStar_filled_white_24{background-position:-211px -284px;height:11px}.glyphsSpriteStar_half_filled_24_white{background-repeat:no-repeat;background-position:-141px -284px;height:12px;width:12px}.glyphsSpriteStar_half_filled_24,.glyphsSpriteStar_white{background-repeat:no-repeat;background-position:-155px -284px;height:12px;width:12px}.glyphsSpriteStar_white{background-position:-169px -284px}.glyphsSpriteStory__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -104px;height:24px;width:24px}.glyphsSpriteTag_up__filled__16__white{background-repeat:no-repeat;background-position:0 -422px;height:16px;width:16px}.glyphsSpriteTag_up__outline__24__blue_5,.glyphsSpriteTag_up__outline__24__grey_5{background-repeat:no-repeat;background-position:-436px -130px;height:24px;width:24px}.glyphsSpriteTag_up__outline__24__grey_5{background-position:-436px -156px}.glyphsSpriteUser__filled__16__white{background-repeat:no-repeat;background-position:-18px -422px;height:16px;width:16px}.glyphsSpriteUser__filled__24__grey_0,.glyphsSpriteUser__filled__24__grey_9{background-repeat:no-repeat;background-position:-436px -182px;height:24px;width:24px}.glyphsSpriteUser__filled__24__grey_9{background-position:-436px -208px}.glyphsSpriteUser__outline__24__grey_9,.glyphsSpriteUser_follow__filled__24__grey_9{background-repeat:no-repeat;background-position:-436px -234px;height:24px;width:24px}.glyphsSpriteUser_follow__filled__24__grey_9{background-position:-436px -260px}.glyphsSpriteUser_follow__outline__24__grey_9,.glyphsSpriteUsers__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -286px;height:24px;width:24px}.glyphsSpriteUsers__outline__24__grey_9{background-position:-436px -312px}.glyphsSpriteVerified_small{background-repeat:no-repeat;background-position:-183px -284px;height:12px;width:12px}.glyphsSpriteVideo_chat__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -338px;height:24px;width:24px}.glyphsSpriteVolume__outline__44{background-repeat:no-repeat;background-position:0 -298px;height:44px;width:44px}.glyphsSpriteVolume_off__filled__44,.glyphsSpriteWhite_Close{background-repeat:no-repeat;background-position:-46px -298px;height:44px;width:44px}.glyphsSpriteWhite_Close{background-position:-196px -273px;height:9px;width:9px}.glyphsSpriteX__filled__12__white{background-repeat:no-repeat;background-position:-197px -284px;height:12px;width:12px}.glyphsSpriteX__outline__24__grey_9{background-repeat:no-repeat;background-position:-436px -364px;height:24px;width:24px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.glyphsSpriteAdd__outline__24__blue_5,.glyphsSpriteAdd__outline__24__grey_9,.glyphsSpriteAdd_friend__outline__96,.glyphsSpriteApp_Icon_28,.glyphsSpriteApp_Icon_30,.glyphsSpriteApp_Icon_36,.glyphsSpriteApp_Icon_45,.glyphsSpriteApp_Icon_60,.glyphsSpriteApp_Icon_IGTV_44,.glyphsSpriteApp_instagram__outline__24__grey_9,.glyphsSpriteApp_messenger__outline__24__grey_9,.glyphsSpriteApp_twitter__outline__24__grey_9,.glyphsSpriteApp_whatsapp__outline__24__grey_9,.glyphsSpriteBirthday_cake,.glyphsSpriteBrowser_Icon_Chrome_28,.glyphsSpriteBrowser_Icon_Firefox_28,.glyphsSpriteBrowser_Icon_Generic_28,.glyphsSpriteBrowser_Icon_Safari_28,.glyphsSpriteCall__outline__24__grey_9,.glyphsSpriteCamera__outline__24__grey_9,.glyphsSpriteChevron_circle_shadow_left,.glyphsSpriteChevron_circle_shadow_right,.glyphsSpriteChevron_down__outline__24__grey_5,.glyphsSpriteChevron_down__outline__24__grey_9,.glyphsSpriteChevron_left__outline__24__grey_9,.glyphsSpriteChevron_right__outline__24__grey_5,.glyphsSpriteChevron_up__outline__24__grey_5,.glyphsSpriteChevron_up__outline__24__grey_9,.glyphsSpriteCircle__outline__24__grey_2,.glyphsSpriteCircle_add__outline__24__grey_5,.glyphsSpriteCircle_add__outline__24__grey_9,.glyphsSpriteCircle_check__filled__24__blue_5,.glyphsSpriteCircle_check__filled__24__green_5,.glyphsSpriteCircle_check__outline__24__blue_5,.glyphsSpriteComment__filled__16__white,.glyphsSpriteComment__outline__24__grey_9,.glyphsSpriteContact_import,.glyphsSpriteContact_import_sm,.glyphsSpriteDelete__outline__24__grey_0,.glyphsSpriteDirect__outline__24__grey_0,.glyphsSpriteDirect__outline__24__grey_9,.glyphsSpriteDirect__outline__96,.glyphsSpriteDownload_2FAC,.glyphsSpriteEmail_confirm,.glyphsSpriteError__outline__24__grey_9,.glyphsSpriteError__outline__96,.glyphsSpriteError_glyph_grey,.glyphsSpriteFB_Logo,.glyphsSpriteFacebook_circle__filled__12__blue_5,.glyphsSpriteFacebook_circle__outline__24__grey_9,.glyphsSpriteFacebook_circle_filled_24,.glyphsSpriteFb_brand_center_grey,.glyphsSpriteForward__outline__24__grey_9,.glyphsSpriteFriend_Follow,.glyphsSpriteGlyph_chevron_right,.glyphsSpriteGlyph_circle_star,.glyphsSpriteGlyph_eye_off,.glyphsSpriteGlyph_volume_off,.glyphsSpriteGlyph_warning,.glyphsSpriteGrey_Close,.glyphsSpriteHashtag__outline__24__grey_9,.glyphsSpriteHeart__filled__16__grey_9,.glyphsSpriteHeart__filled__16__white,.glyphsSpriteHeart__filled__24__grey_9,.glyphsSpriteHeart__filled__24__red_5,.glyphsSpriteHeart__outline__24__grey_9,.glyphsSpriteHome__filled__24__grey_9,.glyphsSpriteHome__outline__24__grey_9,.glyphsSpriteIG_Lite_Direct_Variant_01,.glyphsSpriteIgtv__outline__24__blue_5,.glyphsSpriteIgtv__outline__24__grey_5,.glyphsSpriteInfo__filled__16__grey_9,.glyphsSpriteInput_clear,.glyphsSpriteLink__outline__24__grey_9,.glyphsSpriteLite_app_icon,.glyphsSpriteLocation__outline__24__grey_9,.glyphsSpriteLock__outline__24__grey_9,.glyphsSpriteLock__outline__96,.glyphsSpriteLogged_Out_QP_Glyph,.glyphsSpriteMail__outline__24__grey_9,.glyphsSpriteMenu__outline__24__grey_9,.glyphsSpriteMore_horizontal__filled__24__grey_0,.glyphsSpriteMore_horizontal__outline__16__grey_5,.glyphsSpriteMore_horizontal__outline__24__grey_5,.glyphsSpriteMore_horizontal__outline__24__grey_9,.glyphsSpriteNew_feed_activity,.glyphsSpriteNew_post__outline__24__grey_9,.glyphsSpriteNews_off_outline,.glyphsSpriteNews_off_outline_red,.glyphsSpritePaging_chevron,.glyphsSpritePhone_confirm,.glyphsSpritePhoto_grid__outline__24__blue_5,.glyphsSpritePhoto_grid__outline__24__grey_5,.glyphsSpritePhoto_list__outline__24__blue_5,.glyphsSpritePhoto_list__outline__24__grey_5,.glyphsSpritePlay__filled__16__grey_9,.glyphsSpriteSave__filled__24__grey_9,.glyphsSpriteSave__outline__24__blue_5,.glyphsSpriteSave__outline__24__grey_5,.glyphsSpriteSave__outline__24__grey_9,.glyphsSpriteSearch,.glyphsSpriteSearch__filled__24__grey_9,.glyphsSpriteSearch__outline__24__grey_9,.glyphsSpriteSettings__outline__24__grey_9,.glyphsSpriteShare__outline__24__grey_9,.glyphsSpriteStar_filled_24,.glyphsSpriteStar_filled_white_24,.glyphsSpriteStar_half_filled_24,.glyphsSpriteStar_half_filled_24_white,.glyphsSpriteStory__outline__24__grey_9,.glyphsSpriteTag_up__filled__16__white,.glyphsSpriteTag_up__outline__24__blue_5,.glyphsSpriteTag_up__outline__24__grey_5,.glyphsSpriteUser__filled__16__white,.glyphsSpriteUser__filled__24__grey_0,.glyphsSpriteUser__filled__24__grey_9,.glyphsSpriteUser__outline__24__grey_9,.glyphsSpriteUser_follow__filled__24__grey_9,.glyphsSpriteUser_follow__outline__24__grey_9,.glyphsSpriteUsers__outline__24__grey_9,.glyphsSpriteVerified_small,.glyphsSpriteVideo_chat__outline__24__grey_9,.glyphsSpriteVolume__outline__44,.glyphsSpriteVolume_off__filled__44,.glyphsSpriteWhite_Close,.glyphsSpriteX__filled__12__white,.glyphsSpriteX__outline__24__grey_9{background-image:url(https://users.ampliffy.com/img/sharer/sprite_glyphs_2x_b0268e94bd57.png/b0268e94bd57.png)}.glyphsSpriteAdd__outline__24__blue_5{background-size:456px 413px;background-position:-226px -294px}.glyphsSpriteAdd__outline__24__grey_9{background-size:456px 413px;background-position:-251px -294px}.glyphsSpriteAdd_friend__outline__96,.glyphsSpriteApp_Icon_28{background-size:456px 413px;background-position:-145px 0}.glyphsSpriteApp_Icon_28{background-position:-400px -254px}.glyphsSpriteApp_Icon_30,.glyphsSpriteApp_Icon_36{background-size:456px 413px;background-position:-400px -223px}.glyphsSpriteApp_Icon_36{background-position:-90px -294px}.glyphsSpriteApp_Icon_45,.glyphsSpriteApp_Icon_60{background-size:456px 413px;background-position:-92px -146px}.glyphsSpriteApp_Icon_60{background-position:-339px -223px}.glyphsSpriteApp_Icon_IGTV_44{background-size:456px 413px;background-position:-275px -223px}.glyphsSpriteApp_instagram__outline__24__grey_9{background-size:456px 413px;background-position:-276px -294px}.glyphsSpriteApp_messenger__outline__24__grey_9{background-size:456px 413px;background-position:-301px -294px}.glyphsSpriteApp_twitter__outline__24__grey_9{background-size:456px 413px;background-position:-326px -294px}.glyphsSpriteApp_whatsapp__outline__24__grey_9,.glyphsSpriteBirthday_cake{background-size:456px 413px;background-position:-351px -294px}.glyphsSpriteBirthday_cake{background-position:0 0}.glyphsSpriteBrowser_Icon_Chrome_28{background-size:456px 413px;background-position:-145px -194px}.glyphsSpriteBrowser_Icon_Firefox_28{background-size:456px 413px;background-position:-174px -194px}.glyphsSpriteBrowser_Icon_Generic_28{background-size:456px 413px;background-position:-203px -194px}.glyphsSpriteBrowser_Icon_Safari_28{background-size:456px 413px;background-position:-92px -192px}.glyphsSpriteCall__outline__24__grey_9{background-size:456px 413px;background-position:-376px -294px}.glyphsSpriteCamera__outline__24__grey_9{background-size:456px 413px;background-position:-401px -294px}.glyphsSpriteChevron_circle_shadow_left{background-size:456px 413px;background-position:-183px -223px}.glyphsSpriteChevron_circle_shadow_right{background-size:456px 413px;background-position:-229px -223px}.glyphsSpriteChevron_down__outline__24__grey_5{background-size:456px 413px;background-position:0 -339px}.glyphsSpriteChevron_down__outline__24__grey_9{background-size:456px 413px;background-position:-25px -339px}.glyphsSpriteChevron_left__outline__24__grey_9{background-size:456px 413px;background-position:-50px -339px}.glyphsSpriteChevron_right__outline__24__grey_5{background-size:456px 413px;background-position:-75px -339px}.glyphsSpriteChevron_up__outline__24__grey_5{background-size:456px 413px;background-position:-100px -339px}.glyphsSpriteChevron_up__outline__24__grey_9{background-size:456px 413px;background-position:-125px -339px}.glyphsSpriteCircle__outline__24__grey_2{background-size:456px 413px;background-position:-150px -339px}.glyphsSpriteCircle_add__outline__24__grey_5{background-size:456px 413px;background-position:-175px -339px}.glyphsSpriteCircle_add__outline__24__grey_9{background-size:456px 413px;background-position:-200px -339px}.glyphsSpriteCircle_check__filled__24__blue_5{background-size:456px 413px;background-position:-225px -339px}.glyphsSpriteCircle_check__filled__24__green_5{background-size:456px 413px;background-position:-250px -339px}.glyphsSpriteCircle_check__outline__24__blue_5{background-size:456px 413px;background-position:-275px -339px}.glyphsSpriteComment__filled__16__white{background-size:456px 413px;background-position:-432px -309px}.glyphsSpriteComment__outline__24__grey_9{background-size:456px 413px;background-position:-300px -339px}.glyphsSpriteContact_import_sm{background-size:456px 413px;background-position:-404px -178px}.glyphsSpriteContact_import{background-size:456px 413px;background-position:-404px -146px}.glyphsSpriteDelete__outline__24__grey_0{background-size:456px 413px;background-position:-325px -339px}.glyphsSpriteDirect__outline__24__grey_0{background-size:456px 413px;background-position:-350px -339px}.glyphsSpriteDirect__outline__24__grey_9{background-size:456px 413px;background-position:-375px -339px}.glyphsSpriteDirect__outline__96{background-size:456px 413px;background-position:-145px -97px}.glyphsSpriteDownload_2FAC,.glyphsSpriteEmail_confirm{background-size:456px 413px;background-position:0 -97px}.glyphsSpriteEmail_confirm{background-position:-339px 0}.glyphsSpriteError__outline__24__grey_9{background-size:456px 413px;background-position:-400px -339px}.glyphsSpriteError__outline__96{background-size:456px 413px;background-position:-242px 0}.glyphsSpriteError_glyph_grey{background-size:456px 413px;background-position:0 -364px}.glyphsSpriteFacebook_circle__filled__12__blue_5{background-size:456px 413px;background-position:-404px -207px}.glyphsSpriteFacebook_circle__outline__24__grey_9{background-size:456px 413px;background-position:-25px -364px}.glyphsSpriteFacebook_circle_filled_24{background-size:456px 413px;background-position:-50px -364px}.glyphsSpriteFB_Logo,.glyphsSpriteFb_brand_center_grey{background-size:456px 413px;background-position:-242px -194px}.glyphsSpriteFB_Logo{background-position:-432px -326px}.glyphsSpriteForward__outline__24__grey_9,.glyphsSpriteFriend_Follow{background-size:456px 413px;background-position:-75px -364px}.glyphsSpriteFriend_Follow{background-position:-432px -296px}.glyphsSpriteGlyph_chevron_right{background-size:456px 413px;background-position:-232px -194px}.glyphsSpriteGlyph_circle_star,.glyphsSpriteGlyph_eye_off{background-size:456px 413px;background-position:-92px -97px}.glyphsSpriteGlyph_eye_off{background-position:-127px -294px}.glyphsSpriteGlyph_volume_off{background-size:456px 413px;background-position:-417px -207px}.glyphsSpriteGlyph_warning,.glyphsSpriteGrey_Close{background-size:456px 413px;background-position:-432px -343px}.glyphsSpriteGrey_Close{background-position:-339px -284px}.glyphsSpriteHashtag__outline__24__grey_9{background-size:456px 413px;background-position:-100px -364px}.glyphsSpriteHeart__filled__16__grey_9{background-size:456px 413px;background-position:-432px -360px}.glyphsSpriteHeart__filled__16__white{background-size:456px 413px;background-position:-432px -377px}.glyphsSpriteHeart__filled__24__grey_9{background-size:456px 413px;background-position:-125px -364px}.glyphsSpriteHeart__filled__24__red_5{background-size:456px 413px;background-position:-150px -364px}.glyphsSpriteHeart__outline__24__grey_9{background-size:456px 413px;background-position:-175px -364px}.glyphsSpriteHome__filled__24__grey_9{background-size:456px 413px;background-position:-200px -364px}.glyphsSpriteHome__outline__24__grey_9{background-size:456px 413px;background-position:-225px -364px}.glyphsSpriteIG_Lite_Direct_Variant_01{background-size:456px 413px;background-position:0 -223px}.glyphsSpriteIgtv__outline__24__blue_5{background-size:456px 413px;background-position:-250px -364px}.glyphsSpriteIgtv__outline__24__grey_5{background-size:456px 413px;background-position:-275px -364px}.glyphsSpriteInfo__filled__16__grey_9,.glyphsSpriteInput_clear{background-size:456px 413px;background-position:-432px -394px}.glyphsSpriteInput_clear{background-position:-432px -275px}.glyphsSpriteLink__outline__24__grey_9,.glyphsSpriteLite_app_icon{background-size:456px 413px;background-position:-300px -364px}.glyphsSpriteLite_app_icon{background-position:-339px -73px}.glyphsSpriteLocation__outline__24__grey_9{background-size:456px 413px;background-position:-325px -364px}.glyphsSpriteLock__outline__24__grey_9{background-size:456px 413px;background-position:-350px -364px}.glyphsSpriteLock__outline__96{background-size:456px 413px;background-position:-242px -97px}.glyphsSpriteLogged_Out_QP_Glyph{background-size:456px 413px;background-position:-126px -223px}.glyphsSpriteMail__outline__24__grey_9{background-size:456px 413px;background-position:-375px -364px}.glyphsSpriteMenu__outline__24__grey_9{background-size:456px 413px;background-position:-400px -364px}.glyphsSpriteMore_horizontal__filled__24__grey_0{background-size:456px 413px;background-position:0 -389px}.glyphsSpriteMore_horizontal__outline__16__grey_5{background-size:456px 413px;background-position:-412px -73px}.glyphsSpriteMore_horizontal__outline__24__grey_5{background-size:456px 413px;background-position:-25px -389px}.glyphsSpriteMore_horizontal__outline__24__grey_9{background-size:456px 413px;background-position:-50px -389px}.glyphsSpriteNew_feed_activity{background-size:456px 413px;background-position:-412px -90px}.glyphsSpriteNew_post__outline__24__grey_9{background-size:456px 413px;background-position:-75px -389px}.glyphsSpriteNews_off_outline_red{background-size:456px 413px;background-position:-160px -294px}.glyphsSpriteNews_off_outline{background-size:456px 413px;background-position:-193px -294px}.glyphsSpritePaging_chevron,.glyphsSpritePhone_confirm{background-size:456px 413px;background-position:-100px -389px}.glyphsSpritePhone_confirm{background-position:-339px -146px}.glyphsSpritePhoto_grid__outline__24__blue_5{background-size:456px 413px;background-position:-125px -389px}.glyphsSpritePhoto_grid__outline__24__grey_5{background-size:456px 413px;background-position:-150px -389px}.glyphsSpritePhoto_list__outline__24__blue_5{background-size:456px 413px;background-position:-175px -389px}.glyphsSpritePhoto_list__outline__24__grey_5{background-size:456px 413px;background-position:-200px -389px}.glyphsSpritePlay__filled__16__grey_9{background-size:456px 413px;background-position:-412px -107px}.glyphsSpriteSave__filled__24__grey_9{background-size:456px 413px;background-position:-225px -389px}.glyphsSpriteSave__outline__24__blue_5{background-size:456px 413px;background-position:-250px -389px}.glyphsSpriteSave__outline__24__grey_5{background-size:456px 413px;background-position:-275px -389px}.glyphsSpriteSave__outline__24__grey_9{background-size:456px 413px;background-position:-300px -389px}.glyphsSpriteSearch__filled__24__grey_9{background-size:456px 413px;background-position:-325px -389px}.glyphsSpriteSearch,.glyphsSpriteSearch__outline__24__grey_9{background-size:456px 413px;background-position:-350px -389px}.glyphsSpriteSearch{background-position:-121px -209px}.glyphsSpriteSettings__outline__24__grey_9{background-size:456px 413px;background-position:-375px -389px}.glyphsSpriteShare__outline__24__grey_9{background-size:456px 413px;background-position:-400px -389px}.glyphsSpriteStar_filled_24{background-size:456px 413px;background-position:-325px -194px}.glyphsSpriteStar_filled_white_24{background-size:456px 413px;background-position:-325px -207px}.glyphsSpriteStar_half_filled_24_white{background-size:456px 413px;background-position:-320px -223px}.glyphsSpriteStar_half_filled_24{background-size:456px 413px;background-position:-320px -236px}.glyphsSpriteStory__outline__24__grey_9{background-size:456px 413px;background-position:-432px 0}.glyphsSpriteTag_up__filled__16__white{background-size:456px 413px;background-position:-412px -124px}.glyphsSpriteTag_up__outline__24__blue_5{background-size:456px 413px;background-position:-432px -25px}.glyphsSpriteTag_up__outline__24__grey_5{background-size:456px 413px;background-position:-432px -50px}.glyphsSpriteUser__filled__16__white{background-size:456px 413px;background-position:-121px -192px}.glyphsSpriteUser__filled__24__grey_0{background-size:456px 413px;background-position:-432px -75px}.glyphsSpriteUser__filled__24__grey_9{background-size:456px 413px;background-position:-432px -100px}.glyphsSpriteUser__outline__24__grey_9{background-size:456px 413px;background-position:-432px -125px}.glyphsSpriteUser_follow__filled__24__grey_9{background-size:456px 413px;background-position:-432px -150px}.glyphsSpriteUser_follow__outline__24__grey_9{background-size:456px 413px;background-position:-432px -175px}.glyphsSpriteUsers__outline__24__grey_9{background-size:456px 413px;background-position:-432px -200px}.glyphsSpriteVerified_small{background-size:456px 413px;background-position:-320px -249px}.glyphsSpriteVideo_chat__outline__24__grey_9{background-size:456px 413px;background-position:-432px -225px}.glyphsSpriteVolume__outline__44{background-size:456px 413px;background-position:0 -294px}.glyphsSpriteVolume_off__filled__44,.glyphsSpriteWhite_Close{background-size:456px 413px;background-position:-45px -294px}.glyphsSpriteWhite_Close{background-position:-349px -284px}.glyphsSpriteX__filled__12__white{background-size:456px 413px;background-position:-126px -280px}.glyphsSpriteX__outline__24__grey_9{background-size:456px 413px;background-position:-432px -250px}}\n.debuginfoSpriteBugnub,.debuginfoSpriteDevtools{background-image:url(https://users.ampliffy.com/img/sharer/sprite_debuginfo_04482f505972.png/04482f505972.png);background-repeat:no-repeat;background-position:0 0;height:22px;width:22px}.debuginfoSpriteDevtools{background-position:-24px 0}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.debuginfoSpriteBugnub,.debuginfoSpriteDevtools{background-image:url(https://users.ampliffy.com/img/sharer/sprite_debuginfo_2x_24b85a13663c.png/24b85a13663c.png);background-size:45px 22px;background-position:0 0}.debuginfoSpriteDevtools{background-position:-23px 0}}\n.BARfH{font-size:10px;line-height:12px;margin:-2px 0 -3px}.PIoXz{font-size:12px;line-height:14px;margin:-2px 0 -3px}.xLCgt{font-size:14px;line-height:18px;margin:-3px 0 -4px}.vy6Bb{font-size:16px;line-height:24px;margin:-6px 0 -6px}.LjQVu{font-size:18px;line-height:24px;margin:-4px 0 -6px}.x-6xq{font-size:22px;line-height:26px;margin:-4px 0 -5px}.fKFbl{font-size:28px;line-height:32px;margin:-5px 0 -6px}.T0kll{margin:0}.yUEEX{font-weight:300}.MMzan{font-weight:400}.qyrsm{font-weight:600}.KV-D4{color:#262626;color:rgba(var(--i1d,38,38,38),1)}._0PwGv{color:#8e8e8e;color:rgba(var(--f52,142,142,142),1)}.tx0Md{color:#00376b;color:rgba(var(--fe0,0,55,107),1)}.fDdiY{color:#ed4956;color:rgba(var(--i30,237,73,86),1)}.OgsCw{color:#58c322;color:rgba(var(--b86,88,195,34),1)}.gtFbE{color:#0095f6;color:rgba(var(--d69,0,149,246),1)}.mDXrS{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1)}.fZViY{color:#000;color:rgba(var(--jb7,0,0,0),1)}.h_zdq{color:#fff;color:rgba(var(--eca,255,255,255),1)}.uL8Hv{display:block}._7UhW9 ._7UhW9,.se6yk{display:inline!important;margin:0!important}.fDxYl{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.zuV7c{white-space:pre}.p1tLr{white-space:pre-wrap}.l4b0S{text-align:center}.M8ipN{text-align:left}.lV_gY{text-align:right}.hjZTB{overflow-wrap:break-word;white-space:normal}\n.f_Y_g{border-radius:50%}.RaTbc{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:0 0;border:0;cursor:pointer;padding:0}\n.tlZCJ{left:-9999px;position:absolute}.mwD2G{border:1px solid #dbdbdb;border:1px solid rgba(var(--ca6,219,219,219),1);border-radius:3px;display:inline-block;height:16px;margin:0 8px 0 3px;position:relative;width:16px}.tlZCJ:active~.mwD2G{-webkit-box-shadow:inset 0 0 1px 1px #dbdbdb;box-shadow:inset 0 0 1px 1px #dbdbdb;-webkit-box-shadow:inset 0 0 1px 1px rgba(var(--ca6,219,219,219),1);box-shadow:inset 0 0 1px 1px rgba(var(--ca6,219,219,219),1)}.tlZCJ:focus~.mwD2G{border-color:#0095f6;border-color:rgba(var(--d69,0,149,246),1)}.tlZCJ:checked~.mwD2G::before{content:' ';border-bottom:2px solid #262626;border-bottom:2px solid rgba(var(--i1d,38,38,38),1);border-left:2px solid #262626;border-left:2px solid rgba(var(--i1d,38,38,38),1);display:block;height:3px;left:2px;position:absolute;top:3px;-webkit-transform:rotateZ(-45deg);transform:rotateZ(-45deg);width:8px}.U17kh{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;color:#8e8e8e;color:rgba(var(--f52,142,142,142),1);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;font-size:14px;font-weight:400;line-height:14px}.PLphk{color:#262626;color:rgba(var(--i1d,38,38,38),1);font-weight:600}\n.FqZhB{clip:rect(1px,1px,1px,1px);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}.Kq1Ju{outline:5px auto -webkit-focus-ring-color}\n._0T_XJ::before{background-image:-webkit-gradient(linear,right top,left top,from(rgba(250,250,250,0)),to(#fafafa));background-image:-webkit-linear-gradient(right,rgba(250,250,250,0),#fafafa 100%);background-image:linear-gradient(to left,rgba(250,250,250,0),#fafafa 100%);background-image:-webkit-gradient(linear,right top,left top,from(rgba(var(--b3f,250,250,250),0)),to(rgba(var(--b3f,250,250,250),1)));background-image:-webkit-linear-gradient(right,rgba(var(--b3f,250,250,250),0),rgba(var(--b3f,250,250,250),1) 100%);background-image:linear-gradient(to left,rgba(var(--b3f,250,250,250),0),rgba(var(--b3f,250,250,250),1) 100%);content:'';left:0;height:100%;pointer-events:none;position:absolute;width:16px;z-index:10}._0T_XJ::after{background-image:-webkit-gradient(linear,left top,right top,from(rgba(250,250,250,0)),to(#fafafa));background-image:-webkit-linear-gradient(left,rgba(250,250,250,0),#fafafa);background-image:linear-gradient(to right,rgba(250,250,250,0),#fafafa);background-image:-webkit-gradient(linear,left top,right top,from(rgba(var(--b3f,250,250,250),0)),to(rgba(var(--b3f,250,250,250),1)));background-image:-webkit-linear-gradient(left,rgba(var(--b3f,250,250,250),0),rgba(var(--b3f,250,250,250),1));background-image:linear-gradient(to right,rgba(var(--b3f,250,250,250),0),rgba(var(--b3f,250,250,250),1));content:'';height:100%;pointer-events:none;position:absolute;right:0;width:16px;z-index:1}.UJBD-{overflow:visible!important}\n._-9ffn{height:351px}.Mp8by{border:0;border-radius:22px;-webkit-box-shadow:0 2px 24px rgba(0,0,0,.1);box-shadow:0 2px 24px rgba(0,0,0,.1);height:344px}.DVgrl{background-size:cover;background-repeat:no-repeat;background-position:center center}\n.Szr5J{display:block;overflow:hidden;text-indent:110%;white-space:nowrap}.kIKUG:active{opacity:1}.hUQXy,.hUQXy:visited{color:#0095f6;color:rgba(var(--d69,0,149,246),1)}\n._2dbep{background-color:#fafafa;background-color:rgba(var(--b3f,250,250,250),1);border-radius:50%;-webkit-box-sizing:border-box;box-sizing:border-box;display:block;-webkit-box-flex:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto;overflow:hidden;position:relative}._2dbep::after{border:1px solid rgba(0,0,0,.0975);border:1px solid rgba(var(--jb7,0,0,0),.0975);border-radius:50%;bottom:0;content:'';left:0;pointer-events:none;position:absolute;right:0;top:0}._2dbep:focus{outline:0}.qNELH{cursor:pointer}._6q-tv{height:100%;width:100%;-webkit-touch-callout:none}\n.dCJp8{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background:0 0;border:0;cursor:pointer;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:0;-webkit-flex-grow:0;-ms-flex-positive:0;flex-grow:0;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;padding:0}.afkep{min-height:40px;min-width:40px}\n._4RAzv,._4RAzv:visited{color:#262626;color:rgba(var(--i1d,38,38,38),1)}\n.coreSpriteActivityHeart,.coreSpriteAddText,.coreSpriteAppIcon,.coreSpriteAppStoreButton,.coreSpriteBoomerang,.coreSpriteCall,.coreSpriteCheck,.coreSpriteChevronDark,.coreSpriteChevronDownGrey,.coreSpriteChevronRight,.coreSpriteChevronRightBlue,.coreSpriteChevronRightBlue-3x,.coreSpriteChevronRightBlue-4x,.coreSpriteCi,.coreSpriteClose,.coreSpriteCloseLight,.coreSpriteDesktopNavDirect,.coreSpriteDesktopPhotoGrid,.coreSpriteDesktopPhotoGridActive,.coreSpriteDesktopProfileIGTV,.coreSpriteDesktopProfileIGTVActive,.coreSpriteDesktopProfileSave,.coreSpriteDesktopProfileSaveActive,.coreSpriteDesktopProfileTagged,.coreSpriteDesktopProfileTaggedActive,.coreSpriteDirectHeart,.coreSpriteDismissLarge,.coreSpriteDismissSmall,.coreSpriteDownload,.coreSpriteDropdownArrowBlue5,.coreSpriteDropdownArrowBlue6,.coreSpriteDropdownArrowGrey9,.coreSpriteDropdownArrowWhite,.coreSpriteFacebookIcon,.coreSpriteFacebookIconInverted,.coreSpriteGallery,.coreSpriteGlyphGradient,.coreSpriteGlyphWhite,.coreSpriteGooglePlayButton,.coreSpriteHashtag,.coreSpriteHeartSmall,.coreSpriteHyperlapse,.coreSpriteIgLiteHalfsheetInstagramLogo,.coreSpriteInfo,.coreSpriteInputAccepted,.coreSpriteInputError,.coreSpriteInputRefresh,.coreSpriteKeyhole,.coreSpriteLeftChevron,.coreSpriteLeftPaginationArrow,.coreSpriteLikeAnimationHeart,.coreSpriteLocation,.coreSpriteLocationActive,.coreSpriteLock,.coreSpriteLockSmall,.coreSpriteLoggedOutGenericUpsell,.coreSpriteLoggedOutWordmark,.coreSpriteMobileNavDirect,.coreSpriteMobileNavTypeLogo,.coreSpriteNavBack,.coreSpriteNotificationLeftChevron,.coreSpriteNotificationRightChevron,.coreSpriteOptionsEllipsis,.coreSpriteOptionsEllipsisLight,.coreSpritePagingChevron,.coreSpritePlayIconSmall,.coreSpritePrivateLock,.coreSpriteProfileCamera,.coreSpriteReload,.coreSpriteRightChevron,.coreSpriteRightPaginationArrow,.coreSpriteSaveNull,.coreSpriteSaveStory,.coreSpriteSearchClear,.coreSpriteSearchIcon,.coreSpriteSensitivityIcon,.coreSpriteSensitivityIconSmall,.coreSpriteSpeechBubbleSmall,.coreSpriteSpinsta,.coreSpriteSpinstaNux,.coreSpriteSpinstaStory,.coreSpriteStar,.coreSpriteStoryCreation,.coreSpriteStoryCreationAlt,.coreSpriteStoryRing,.coreSpriteStoryViewCount,.coreSpriteTaggedNull,.coreSpriteUnreadComments,.coreSpriteUnreadLikes,.coreSpriteUnreadRelationships,.coreSpriteUnreadUsertags,.coreSpriteVerifiedBadge,.coreSpriteVerifiedBadgeSmall,.coreSpriteVideoNux,.coreSpriteViewCount,.coreSpriteWindowsStoreButton{background-image:url(https://users.ampliffy.com/img/sharer/sprite_core_576406ccc24b.png/576406ccc24b.png)}.coreSpriteActivityHeart,.coreSpriteAddText{background-repeat:no-repeat;background-position:-275px -132px;height:62px;width:62px}.coreSpriteAddText{background-position:-405px -34px;height:24px;width:24px}.coreSpriteAppIcon,.coreSpriteAppStoreButton{background-repeat:no-repeat;background-position:-341px -246px;height:40px;width:40px}.coreSpriteAppStoreButton{background-position:0 -181px;height:41px;width:128px}.coreSpriteBoomerang,.coreSpriteCall{background-repeat:no-repeat;background-position:-252px -181px;height:17px;width:17px}.coreSpriteCall{background-position:-405px -320px;height:22px;width:22px}.coreSpriteCheck,.coreSpriteChevronDark{background-repeat:no-repeat;background-position:0 -224px;height:62px;width:62px}.coreSpriteChevronDark{background-position:-179px -306px;height:10px;width:6px}.coreSpriteChevronDownGrey,.coreSpriteChevronRight{background-repeat:no-repeat;background-position:-235px -288px;height:12px;width:12px}.coreSpriteChevronRight{background-position:-266px -161px;height:11px;width:6px}.coreSpriteChevronRightBlue-3x{background-repeat:no-repeat;background-position:0 -319px;height:53px;width:32px}.coreSpriteChevronRightBlue-4x{background-repeat:no-repeat;background-position:-341px -124px;height:70px;width:41px}.coreSpriteChevronRightBlue{background-repeat:no-repeat;background-position:0 -374px;height:18px;width:11px}.coreSpriteCi,.coreSpriteClose{background-repeat:no-repeat;background-position:-405px 0;height:32px;width:25px}.coreSpriteClose{background-position:-383px -246px;height:20px;width:20px}.coreSpriteCloseLight,.coreSpriteDesktopNavDirect{background-repeat:no-repeat;background-position:-405px -60px;height:24px;width:24px}.coreSpriteDesktopNavDirect{background-position:-405px -86px}.coreSpriteDesktopPhotoGrid,.coreSpriteDesktopPhotoGridActive{background-repeat:no-repeat;background-position:-249px -288px;height:12px;width:12px}.coreSpriteDesktopPhotoGridActive{background-position:-263px -288px}.coreSpriteDesktopProfileIGTV,.coreSpriteDesktopProfileIGTVActive{background-repeat:no-repeat;background-position:-277px -288px;height:12px;width:12px}.coreSpriteDesktopProfileIGTVActive{background-position:-291px -288px}.coreSpriteDesktopProfileSave,.coreSpriteDesktopProfileSaveActive{background-repeat:no-repeat;background-position:-351px -319px;height:12px;width:10px}.coreSpriteDesktopProfileSaveActive{background-position:-363px -319px}.coreSpriteDesktopProfileTagged,.coreSpriteDesktopProfileTaggedActive{background-repeat:no-repeat;background-position:-305px -288px;height:12px;width:12px}.coreSpriteDesktopProfileTaggedActive{background-position:-319px -288px}.coreSpriteDirectHeart,.coreSpriteDismissLarge{background-repeat:no-repeat;background-position:-405px -112px;height:24px;width:24px}.coreSpriteDismissLarge{background-position:-390px -288px;height:10px;width:10px}.coreSpriteDismissSmall,.coreSpriteDownload{background-repeat:no-repeat;background-position:-320px -278px;height:8px;width:8px}.coreSpriteDownload{background-position:-64px -224px;height:62px;width:62px}.coreSpriteDropdownArrowBlue5{background-repeat:no-repeat;background-position:-384px -187px;height:6px;width:9px}.coreSpriteDropdownArrowBlue6,.coreSpriteDropdownArrowGrey9{background-repeat:no-repeat;background-position:-330px -278px;height:6px;width:9px}.coreSpriteDropdownArrowGrey9{background-position:-395px -187px;width:8px}.coreSpriteDropdownArrowWhite,.coreSpriteFacebookIcon{background-repeat:no-repeat;background-position:-187px -306px;height:6px;width:9px}.coreSpriteFacebookIcon{background-position:-320px -224px;height:16px;width:16px}.coreSpriteFacebookIconInverted,.coreSpriteGallery{background-repeat:no-repeat;background-position:-320px -242px;height:16px;width:16px}.coreSpriteGallery{background-position:-405px -138px;height:24px;width:24px}.coreSpriteGlyphGradient,.coreSpriteGlyphWhite{background-repeat:no-repeat;background-position:-230px -53px;height:40px;width:40px}.coreSpriteGlyphWhite{background-position:-105px -288px;height:29px;width:29px}.coreSpriteGooglePlayButton,.coreSpriteHashtag{background-repeat:no-repeat;background-position:-98px -53px;height:41px;width:130px}.coreSpriteHashtag{background-position:-322px -319px;height:17px;width:13px}.coreSpriteHeartSmall,.coreSpriteHyperlapse{background-repeat:no-repeat;background-position:-384px -124px;height:19px;width:19px}.coreSpriteHyperlapse{background-position:-252px -200px;height:17px;width:17px}.coreSpriteIgLiteHalfsheetInstagramLogo,.coreSpriteInfo{background-repeat:no-repeat;background-position:-275px 0;height:64px;width:64px}.coreSpriteInfo{background-position:-156px -319px;height:34px;width:34px}.coreSpriteInputAccepted,.coreSpriteInputError,.coreSpriteInputRefresh{background-repeat:no-repeat;background-position:-405px -344px;height:22px;width:22px}.coreSpriteInputError,.coreSpriteInputRefresh{background-position:-275px -196px}.coreSpriteInputRefresh{background-position:-299px -196px;width:21px}.coreSpriteKeyhole,.coreSpriteLeftChevron{background-repeat:no-repeat;background-position:-128px -224px;height:62px;width:62px}.coreSpriteLeftChevron{background-position:-226px -319px;height:30px;width:30px}.coreSpriteLeftPaginationArrow{background-repeat:no-repeat;background-position:-34px -319px;height:40px;width:40px}.coreSpriteLikeAnimationHeart{background-repeat:no-repeat;background-position:0 -98px;height:81px;width:92px}.coreSpriteLocation,.coreSpriteLocationActive{background-repeat:no-repeat;background-position:-250px -140px;height:19px;width:16px}.coreSpriteLocationActive{background-position:-322px -196px;height:20px}.coreSpriteLock,.coreSpriteLockSmall{background-repeat:no-repeat;background-position:-94px -98px;height:76px;width:76px}.coreSpriteLockSmall{background-position:0 0;height:96px;width:96px}.coreSpriteLoggedOutGenericUpsell{background-repeat:no-repeat;background-position:-341px -64px;height:58px;width:58px}.coreSpriteLoggedOutWordmark,.coreSpriteMobileNavDirect{background-repeat:no-repeat;background-position:-98px 0;height:51px;width:175px}.coreSpriteMobileNavDirect{background-position:-405px -164px;height:24px;width:24px}.coreSpriteMobileNavTypeLogo,.coreSpriteNavBack{background-repeat:no-repeat;background-position:0 -288px;height:29px;width:103px}.coreSpriteNavBack{background-position:-391px -196px;height:20px;width:12px}.coreSpriteNotificationLeftChevron{background-repeat:no-repeat;background-position:-391px -218px;height:21px;width:11px}.coreSpriteNotificationRightChevron,.coreSpriteOptionsEllipsis{background-repeat:no-repeat;background-position:-337px -319px;height:15px;width:12px}.coreSpriteOptionsEllipsis{background-position:-320px -260px;height:16px;width:16px}.coreSpriteOptionsEllipsisLight,.coreSpritePagingChevron,.coreSpritePlayIconSmall{background-repeat:no-repeat;background-position:-405px -190px;height:24px;width:24px}.coreSpritePagingChevron,.coreSpritePlayIconSmall{background-position:-405px -216px}.coreSpritePlayIconSmall{background-position:-384px -145px;height:19px;width:19px}.coreSpritePrivateLock,.coreSpriteProfileCamera{background-repeat:no-repeat;background-position:-118px -319px;height:36px;width:36px}.coreSpriteProfileCamera{background-position:-192px -224px;height:62px;width:62px}.coreSpriteReload,.coreSpriteRightChevron{background-repeat:no-repeat;background-position:-136px -288px;height:29px;width:29px}.coreSpriteRightChevron{background-position:-258px -319px;height:30px;width:30px}.coreSpriteRightPaginationArrow,.coreSpriteSaveNull{background-repeat:no-repeat;background-position:-76px -319px;height:40px;width:40px}.coreSpriteSaveNull{background-position:-256px -224px;height:62px;width:62px}.coreSpriteSaveStory,.coreSpriteSearchClear{background-repeat:no-repeat;background-position:-405px -242px;height:24px;width:24px}.coreSpriteSearchClear{background-position:-250px -98px;height:20px;width:20px}.coreSpriteSearchIcon,.coreSpriteSensitivityIcon{background-repeat:no-repeat;background-position:-167px -306px;height:10px;width:10px}.coreSpriteSensitivityIcon{background-position:-341px -196px;height:48px;width:48px}.coreSpriteSensitivityIconSmall{background-repeat:no-repeat;background-position:-192px -319px;height:32px;width:32px}.coreSpriteSpeechBubbleSmall,.coreSpriteSpinsta{background-repeat:no-repeat;background-position:-384px -166px;height:19px;width:19px}.coreSpriteSpinsta{background-position:-347px -288px;height:11px;width:12px}.coreSpriteSpinstaNux,.coreSpriteSpinstaStory{background-repeat:no-repeat;background-position:-290px -319px;height:30px;width:30px}.coreSpriteSpinstaStory{background-position:-361px -288px;height:11px;width:12px}.coreSpriteStar,.coreSpriteStoryCreation{background-repeat:no-repeat;background-position:-405px -268px;height:24px;width:24px}.coreSpriteStoryCreation{background-position:-405px -294px}.coreSpriteStoryCreationAlt{background-repeat:no-repeat;background-position:-383px -268px;height:18px;width:18px}.coreSpriteStoryRing,.coreSpriteStoryViewCount{background-repeat:no-repeat;background-position:-275px -66px;height:64px;width:64px}.coreSpriteStoryViewCount{background-position:-375px -288px;height:10px;width:13px}.coreSpriteTaggedNull,.coreSpriteUnreadComments{background-repeat:no-repeat;background-position:-341px 0;height:62px;width:62px}.coreSpriteUnreadComments{background-position:-203px -288px;height:14px;width:14px}.coreSpriteUnreadLikes,.coreSpriteUnreadRelationships{background-repeat:no-repeat;background-position:-219px -288px;height:12px;width:14px}.coreSpriteUnreadRelationships{background-position:-250px -161px;height:13px}.coreSpriteUnreadUsertags,.coreSpriteVerifiedBadge{background-repeat:no-repeat;background-position:-167px -288px;height:16px;width:16px}.coreSpriteVerifiedBadge{background-position:-250px -120px;height:18px;width:18px}.coreSpriteVerifiedBadgeSmall{background-repeat:no-repeat;background-position:-333px -288px;height:12px;width:12px}.coreSpriteVideoNux,.coreSpriteViewCount{background-repeat:no-repeat;background-position:-172px -98px;height:76px;width:76px}.coreSpriteViewCount{background-position:-185px -288px;height:16px;width:16px}.coreSpriteWindowsStoreButton{background-repeat:no-repeat;background-position:-130px -181px;height:41px;width:120px}@media (min-device-pixel-ratio:1.5),(-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.coreSpriteActivityHeart,.coreSpriteAddText,.coreSpriteAppIcon,.coreSpriteAppStoreButton,.coreSpriteBoomerang,.coreSpriteCall,.coreSpriteCheck,.coreSpriteChevronDark,.coreSpriteChevronDownGrey,.coreSpriteChevronRight,.coreSpriteChevronRightBlue,.coreSpriteCi,.coreSpriteClose,.coreSpriteCloseLight,.coreSpriteDesktopNavDirect,.coreSpriteDesktopPhotoGrid,.coreSpriteDesktopPhotoGridActive,.coreSpriteDesktopProfileIGTV,.coreSpriteDesktopProfileIGTVActive,.coreSpriteDesktopProfileSave,.coreSpriteDesktopProfileSaveActive,.coreSpriteDesktopProfileTagged,.coreSpriteDesktopProfileTaggedActive,.coreSpriteDirectHeart,.coreSpriteDismissLarge,.coreSpriteDismissSmall,.coreSpriteDownload,.coreSpriteDropdownArrowBlue5,.coreSpriteDropdownArrowBlue6,.coreSpriteDropdownArrowGrey9,.coreSpriteDropdownArrowWhite,.coreSpriteFacebookIcon,.coreSpriteFacebookIconInverted,.coreSpriteGallery,.coreSpriteGlyphGradient,.coreSpriteGlyphWhite,.coreSpriteGooglePlayButton,.coreSpriteHashtag,.coreSpriteHeartSmall,.coreSpriteHyperlapse,.coreSpriteIgLiteHalfsheetInstagramLogo,.coreSpriteInfo,.coreSpriteInputAccepted,.coreSpriteInputError,.coreSpriteInputRefresh,.coreSpriteKeyhole,.coreSpriteLeftChevron,.coreSpriteLeftPaginationArrow,.coreSpriteLikeAnimationHeart,.coreSpriteLocation,.coreSpriteLocationActive,.coreSpriteLock,.coreSpriteLockSmall,.coreSpriteLoggedOutGenericUpsell,.coreSpriteLoggedOutWordmark,.coreSpriteMobileNavDirect,.coreSpriteMobileNavTypeLogo,.coreSpriteNavBack,.coreSpriteNotificationLeftChevron,.coreSpriteNotificationRightChevron,.coreSpriteNullProfile,.coreSpriteOptionsEllipsis,.coreSpriteOptionsEllipsisLight,.coreSpritePagingChevron,.coreSpritePlayIconSmall,.coreSpritePrivateLock,.coreSpriteProfileCamera,.coreSpriteReload,.coreSpriteRightChevron,.coreSpriteRightPaginationArrow,.coreSpriteSaveNull,.coreSpriteSaveStory,.coreSpriteSearchClear,.coreSpriteSearchIcon,.coreSpriteSensitivityIcon,.coreSpriteSensitivityIconSmall,.coreSpriteSpeechBubbleSmall,.coreSpriteSpinsta,.coreSpriteSpinstaNux,.coreSpriteSpinstaStory,.coreSpriteStar,.coreSpriteStoryCreation,.coreSpriteStoryCreationAlt,.coreSpriteStoryRing,.coreSpriteStoryViewCount,.coreSpriteTaggedNull,.coreSpriteUnreadComments,.coreSpriteUnreadLikes,.coreSpriteUnreadRelationships,.coreSpriteUnreadUsertags,.coreSpriteVerifiedBadge,.coreSpriteVerifiedBadgeSmall,.coreSpriteVideoNux,.coreSpriteViewCount,.coreSpriteWindowsStoreButton,.coreSpriteWordmark{background-image:url(https://users.ampliffy.com/img/sharer/sprite_core_2x_935344957e35.png/935344957e35.png)}.coreSpriteActivityHeart,.coreSpriteAddText{background-size:411px 396px;background-position:-273px -130px}.coreSpriteAddText{background-position:-247px -149px}.coreSpriteAppIcon,.coreSpriteAppStoreButton{background-size:411px 396px;background-position:-338px -171px}.coreSpriteAppStoreButton{background-position:0 -231px}.coreSpriteBoomerang,.coreSpriteCall{background-size:411px 396px;background-position:-379px -194px}.coreSpriteCall{background-position:-250px -231px}.coreSpriteCheck,.coreSpriteChevronDark{background-size:411px 396px;background-position:-273px -193px}.coreSpriteChevronDark{background-position:-401px -66px}.coreSpriteChevronDownGrey,.coreSpriteChevronRight{background-size:411px 396px;background-position:-255px -131px}.coreSpriteChevronRight{background-position:-401px -77px}.coreSpriteChevronRightBlue,.coreSpriteCi{background-size:411px 396px;background-position:-401px 0}.coreSpriteCi{background-position:-243px -97px}.coreSpriteClose,.coreSpriteCloseLight{background-size:411px 396px;background-position:-379px -212px}.coreSpriteCloseLight{background-position:-247px -174px}.coreSpriteDesktopNavDirect{background-size:411px 396px;background-position:-247px -199px}.coreSpriteDesktopPhotoGrid{background-size:411px 396px;background-position:-177px -366px}.coreSpriteDesktopPhotoGridActive{background-size:411px 396px;background-position:-189px -366px}.coreSpriteDesktopProfileIGTV{background-size:411px 396px;background-position:-315px -319px}.coreSpriteDesktopProfileIGTVActive{background-size:411px 396px;background-position:-125px -366px}.coreSpriteDesktopProfileSave{background-size:411px 396px;background-position:-401px -18px}.coreSpriteDesktopProfileSaveActive{background-size:411px 396px;background-position:-401px -31px}.coreSpriteDesktopProfileTagged{background-size:411px 396px;background-position:-138px -366px}.coreSpriteDesktopProfileTaggedActive{background-size:411px 396px;background-position:-151px -366px}.coreSpriteDirectHeart,.coreSpriteDismissLarge{background-size:411px 396px;background-position:-164px -336px}.coreSpriteDismissLarge{background-position:-401px -44px}.coreSpriteDismissSmall,.coreSpriteDownload{background-size:411px 396px;background-position:-401px -89px}.coreSpriteDownload{background-position:0 -273px}.coreSpriteDropdownArrowBlue5{background-size:411px 396px;background-position:-401px -98px}.coreSpriteDropdownArrowBlue6{background-size:411px 396px;background-position:-401px -105px}.coreSpriteDropdownArrowGrey9{background-size:411px 396px;background-position:-401px -119px}.coreSpriteDropdownArrowWhite,.coreSpriteFacebookIcon{background-size:411px 396px;background-position:-401px -112px}.coreSpriteFacebookIcon{background-position:-273px -256px}.coreSpriteFacebookIconInverted,.coreSpriteGallery{background-size:411px 396px;background-position:-290px -256px}.coreSpriteGallery{background-position:-189px -336px}.coreSpriteGlyphGradient,.coreSpriteGlyphWhite{background-size:411px 396px;background-position:-338px -212px}.coreSpriteGlyphWhite{background-position:-104px -336px}.coreSpriteGooglePlayButton,.coreSpriteHashtag{background-size:411px 396px;background-position:-97px -52px}.coreSpriteHashtag{background-position:-111px -366px}.coreSpriteHeartSmall,.coreSpriteHyperlapse{background-size:411px 396px;background-position:-379px -233px}.coreSpriteHyperlapse{background-position:-93px -366px}.coreSpriteIgLiteHalfsheetInstagramLogo{background-size:411px 396px;background-position:-273px 0}.coreSpriteInfo,.coreSpriteInputAccepted{background-size:411px 396px;background-position:-176px -97px}.coreSpriteInputAccepted{background-position:-315px -273px}.coreSpriteInputError,.coreSpriteInputRefresh{background-size:411px 396px;background-position:-315px -296px}.coreSpriteInputRefresh{background-position:-379px -171px}.coreSpriteKeyhole,.coreSpriteLeftChevron{background-size:411px 396px;background-position:-63px -273px}.coreSpriteLeftChevron{background-position:0 -366px}.coreSpriteLeftPaginationArrow{background-size:411px 396px;background-position:-338px -253px}.coreSpriteLikeAnimationHeart{background-size:411px 396px;background-position:0 -149px}.coreSpriteLocation,.coreSpriteLocationActive{background-size:411px 396px;background-position:-381px -336px}.coreSpriteLocationActive{background-position:-364px -336px}.coreSpriteLock,.coreSpriteLockSmall{background-size:411px 396px;background-position:-93px -149px}.coreSpriteLockSmall{background-position:0 0}.coreSpriteLoggedOutGenericUpsell{background-size:411px 396px;background-position:-338px -63px}.coreSpriteLoggedOutWordmark,.coreSpriteMobileNavDirect{background-size:411px 396px;background-position:-97px 0}.coreSpriteMobileNavDirect{background-position:-214px -336px}.coreSpriteMobileNavTypeLogo,.coreSpriteNavBack{background-size:411px 396px;background-position:0 -336px}.coreSpriteNavBack{background-position:-387px -122px}.coreSpriteNotificationLeftChevron{background-size:411px 396px;background-position:-387px -143px}.coreSpriteNotificationRightChevron{background-size:411px 396px;background-position:-324px -256px}.coreSpriteNullProfile,.coreSpriteOptionsEllipsis{background-size:411px 396px;background-position:-126px -273px}.coreSpriteOptionsEllipsis{background-position:-307px -256px}.coreSpriteOptionsEllipsisLight{background-size:411px 396px;background-position:-239px -336px}.coreSpritePagingChevron,.coreSpritePlayIconSmall{background-size:411px 396px;background-position:-264px -336px}.coreSpritePlayIconSmall{background-position:-379px -274px}.coreSpritePrivateLock,.coreSpriteProfileCamera{background-size:411px 396px;background-position:-228px -52px}.coreSpriteProfileCamera{background-position:-189px -273px}.coreSpriteReload,.coreSpriteRightChevron{background-size:411px 396px;background-position:-134px -336px}.coreSpriteRightChevron{background-position:-31px -366px}.coreSpriteRightPaginationArrow,.coreSpriteSaveNull{background-size:411px 396px;background-position:-338px -294px}.coreSpriteSaveNull{background-position:-252px -273px}.coreSpriteSaveStory,.coreSpriteSearchClear{background-size:411px 396px;background-position:-289px -336px}.coreSpriteSearchClear{background-position:-379px -253px}.coreSpriteSearchIcon,.coreSpriteSensitivityIcon{background-size:411px 396px;background-position:-401px -55px}.coreSpriteSensitivityIcon{background-position:-338px -122px}.coreSpriteSensitivityIconSmall{background-size:411px 396px;background-position:-210px -97px}.coreSpriteSpeechBubbleSmall,.coreSpriteSpinsta{background-size:411px 396px;background-position:-379px -294px}.coreSpriteSpinsta{background-position:-202px -366px}.coreSpriteSpinstaNux,.coreSpriteSpinstaStory{background-size:411px 396px;background-position:-62px -366px}.coreSpriteSpinstaStory{background-position:-93px -384px}.coreSpriteStar,.coreSpriteStoryCreation{background-size:411px 396px;background-position:-314px -336px}.coreSpriteStoryCreation{background-position:-339px -336px}.coreSpriteStoryCreationAlt,.coreSpriteStoryRing{background-size:411px 396px;background-position:-379px -314px}.coreSpriteStoryRing{background-position:-273px -65px}.coreSpriteStoryViewCount,.coreSpriteTaggedNull{background-size:411px 396px;background-position:-215px -366px}.coreSpriteTaggedNull{background-position:-338px 0}.coreSpriteUnreadComments,.coreSpriteUnreadLikes{background-size:411px 396px;background-position:-210px -131px}.coreSpriteUnreadLikes{background-position:-240px -131px}.coreSpriteUnreadRelationships{background-size:411px 396px;background-position:-225px -131px}.coreSpriteUnreadUsertags,.coreSpriteVerifiedBadge{background-size:411px 396px;background-position:-176px -131px}.coreSpriteVerifiedBadge{background-position:-250px -254px}.coreSpriteVerifiedBadgeSmall{background-size:411px 396px;background-position:-164px -366px}.coreSpriteVideoNux,.coreSpriteViewCount{background-size:411px 396px;background-position:-170px -149px}.coreSpriteViewCount{background-position:-193px -131px}.coreSpriteWindowsStoreButton,.coreSpriteWordmark{background-size:411px 396px;background-position:-129px -231px}.coreSpriteWordmark{background-position:0 -97px}}\n.vi798{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row}.Ckrof{position:absolute}\n._9nCnY,.ekfSF{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;height:100%}.ekfSF{overflow-x:auto;overflow-y:hidden;-ms-overflow-style:none;scrollbar-width:none}.ekfSF::-webkit-scrollbar{display:none}.EcJQs{height:100%;width:100%}\n.POSa_,._6CZji{background:0 0;border:0;justify-self:center;outline:0;padding:16px 8px;position:absolute;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.oevZr{padding:0}.POSa_,._6CZji{cursor:pointer}.POSa_{left:0}._6CZji{right:0}.Kf8kP,.LA45P{-webkit-box-flex:0;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto}.Kf8kP{-webkit-transform:scaleX(-1);transform:scaleX(-1)}\n.piCib{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.dsJ8D{margin:16px;-webkit-box-align:stretch;-webkit-align-items:stretch;-ms-flex-align:stretch;align-items:stretch;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}._08v79{margin:16px 32px;text-align:center}._08v79>:nth-child(n+2){padding-top:16px}._08v79:first-child,.dsJ8D:first-child{margin-top:32px}.mt3GC{margin-top:16px}.mt3GC:only-child{margin-top:0}.mt3GC:only-child .aOOlW:first-child{border-top:none;border-top-left-radius:12px;border-top-right-radius:12px}.aOOlW{background-color:transparent;border-bottom:0;border-left:0;border-right:0;border-top:1px solid #dbdbdb;border-top:1px solid rgba(var(--b6a,219,219,219),1);cursor:pointer;line-height:1.5;margin:0;min-height:48px;padding:4px 8px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;vertical-align:middle}.aOOlW:last-of-type{border-bottom-left-radius:12px;border-bottom-right-radius:12px}.aOOlW:not(.SRPMb):active{-webkit-tap-highlight-color:transparent;background-color:rgba(0,0,0,.1);opacity:1}.HoLwm{color:inherit}.bIiDR{color:#0095f6;color:rgba(var(--d69,0,149,246),1);font-weight:700}.-Cab_{color:#ed4956;color:rgba(var(--i30,237,73,86),1);font-weight:700}._9gx9x,.bIiDR._9gx9x,.HoLwm._9gx9x,.-Cab_._9gx9x{cursor:default;color:#8e8e8e;color:rgba(var(--f52,142,142,142),1)}.SRPMb{cursor:default}\n.pbNvD{-webkit-animation:IGCoreModalShow .1s ease-out;animation:IGCoreModalShow .1s ease-out;-webkit-flex-shrink:1;-ms-flex-negative:1;flex-shrink:1;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;margin:20px;max-height:calc(100% - 40px)}.pbNvD.gD9tr{-webkit-animation:none;animation:none}.fPMEg{width:260px}.FrS-d{width:548px}.BHb1X{height:50%}.EUFwJ{position:absolute;right:-42px;top:4px}._1XyCr{background-color:#fff;background-color:rgba(var(--f23,255,255,255),1);border-radius:12px;max-height:100%;overflow:hidden}.QZZGH._1XyCr{background-color:transparent}.BHb1X ._1XyCr{height:100%}@-webkit-keyframes IGCoreModalShow{0%{opacity:0;-webkit-transform:scale(1.2);transform:scale(1.2)}to{opacity:1;-webkit-transform:scale(1);transform:scale(1)}}@keyframes IGCoreModalShow{0%{opacity:0;-webkit-transform:scale(1.2);transform:scale(1.2)}to{opacity:1;-webkit-transform:scale(1);transform:scale(1)}}@media (max-width:735px){.FrS-d{-webkit-align-self:stretch;-ms-flex-item-align:stretch;align-self:stretch;-webkit-animation:none;animation:none;border-radius:0;-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;margin:0;max-height:100%;width:100%}}@media (max-width:736px){.BHb1X{height:unset}}@media (min-width:736px){.fPMEg{width:400px}}\n.RnEpo{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background-color:rgba(0,0,0,.25);bottom:0;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;left:0;-webkit-overflow-scrolling:touch !important;overflow-y:auto !important;position:fixed;right:0;-webkit-tap-highlight-color:transparent;top:0;z-index:100}.xpORG{-webkit-box-pack:start;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start}.AuINE{-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end}.Yx5HN{-webkit-justify-content:space-around;-ms-flex-pack:distribute;justify-content:space-around}._Yhr4{-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.RnEpo._9Mt7n{overflow:hidden}.yvwbg{left:-9999px;opacity:0;position:fixed}\n._8-yf5{display:block;position:relative}.edmGD{-webkit-filter:drop-shadow(0 0 .75px rgba(0,0,0,.42)) drop-shadow(0 1px .5px rgba(0,0,0,.18)) drop-shadow(0 2px 3px rgba(0,0,0,.2));filter:drop-shadow(0 0 .75px rgba(0,0,0,.42)) drop-shadow(0 1px .5px rgba(0,0,0,.18)) drop-shadow(0 2px 3px rgba(0,0,0,.2))}\n.xlTJg{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;margin:0 auto}.G3yoz{border-radius:50%;overflow:hidden}.OYmo1{margin-left:34%;margin-top:34%;position:absolute}\n.W4P49{background-color:#dbdbdb;background-color:rgba(var(--b38,219,219,219),1);border:0;height:1px;margin:0;width:100%}\n.eiUFA{border-bottom:1px solid #dbdbdb;border-bottom:1px solid rgba(var(--b6a,219,219,219),1);-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;height:43px}.WaOAr{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-flex:0;-webkit-flex:0 0 48px;-ms-flex:0 0 48px;flex:0 0 48px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.m82CD{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;font-size:16px;font-weight:600;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;line-height:24px;text-align:center}.TNiR1{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;font-size:16px;font-weight:600;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;line-height:24px;overflow:hidden;text-align:center;text-overflow:ellipsis;white-space:nowrap}\n.rZ_Tm{padding:12px}.BHY8D{margin:0 auto;height:4px;background-color:#dbdbdb;background-color:rgba(var(--b6a,219,219,219),1);width:48px;border-radius:2px}.xkuux{-webkit-overflow-scrolling:touch;background-color:#fff;background-color:rgba(var(--f23,255,255,255),1);border-top-left-radius:12px;border-top-right-radius:12px;-webkit-box-shadow:0 0 10px rgba(0,0,0,.2);box-shadow:0 0 10px rgba(0,0,0,.2);height:150%;overflow:hidden;width:100%}.xkuux.dcGQ0{background-color:rgba(168,168,168,.8);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.YkJYY{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;overflow:visible}\n.wpO6b{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;background:0 0;border:0;cursor:pointer;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;padding:8px}.ZQScA{padding:0}\n.-um-G{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-animation:IGCoreNotificationSlideIn .5s 1;animation:IGCoreNotificationSlideIn .5s 1;background-color:#fff;background-color:rgba(var(--d87,255,255,255),1);border-radius:8px;-webkit-box-shadow:0 0 6px rgba(0,0,0,.2);box-shadow:0 0 6px rgba(0,0,0,.2);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;left:50%;min-width:240px;padding:16px;position:fixed;top:6px;-webkit-transform:translateX(-50%);transform:translateX(-50%)}.IX_0X{min-width:320px}@-webkit-keyframes IGCoreNotificationSlideIn{0%{top:-50px}to{top:6px}}@keyframes IGCoreNotificationSlideIn{0%{top:-50px}to{top:6px}}@media (max-width:735px){.-um-G{width:100%}}\n.z79H6{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff;background-color:rgba(var(--d87,255,255,255),1);border:2px solid #dbdbdb;border:2px solid rgba(var(--ca6,219,219,219),1);border-radius:50%;-webkit-box-sizing:border-box;box-sizing:border-box;height:18px;margin-right:8px;min-width:18px;-webkit-transition:.15s all linear;transition:.15s all linear;width:18px}.z79H6.rOa8Z{height:24px;margin-right:12px;min-width:24px;width:24px}.z79H6:checked{border:5px solid #0095f6;border:5px solid rgba(var(--d69,0,149,246),1)}.z79H6.rOa8Z:checked{border:7px solid #0095f6;border:7px solid rgba(var(--d69,0,149,246),1)}.XAiP-{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-sizing:border-box;box-sizing:border-box;cursor:pointer;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;margin-top:4px;position:relative}.XAiP-._9X526{margin:0}\n.QxuJw{color:#262626;color:rgba(var(--i1d,38,38,38),1);display:block;font-weight:600;text-transform:uppercase;-webkit-transition:opacity 250ms ease-in-out;transition:opacity 250ms ease-in-out}._9MPbZ{border-bottom:solid 1px #262626;border-bottom:solid 1px rgba(var(--i1d,38,38,38),1);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;opacity:.3;padding:12px 0}.yoyVB{border-top:solid 1px transparent;padding:16px;opacity:.3}._07c0L .QxuJw{border:0}.jkw7z{opacity:1}.jhrQ-{border-top:solid 1px #262626;border-top:solid 1px rgba(var(--i1d,38,38,38),1)}.iKPdZ{letter-spacing:1px}.iXT5c{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;width:100%}.LUjf2{border-top:1px solid #dbdbdb;border-top:1px solid rgba(var(--b38,219,219,219),1);-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}\n.j_2Hd{border-radius:6px;border:1px solid #dbdbdb;border:1px solid rgba(var(--b38,219,219,219),1);color:#262626;color:rgba(var(--i1d,38,38,38),1);-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;font-size:14px;line-height:30px;margin:0;overflow:visible;padding:4px 12px}.uMkC7{background:0 0}.RO68f{background:#fafafa;background:rgba(var(--b3f,250,250,250),1)}.j_2Hd:focus,.cb9Ul{outline:auto 2px #3b99fc;outline:auto 5px -webkit-focus-ring-color;outline-offset:-2px}.j_2Hd:disabled,.-wiOT.KowqB{background-color:#efefef;background-color:rgba(var(--bb2,239,239,239),1);border-color:#dbdbdb;border-color:rgba(var(--b38,219,219,219),1);color:#8e8e8e;color:rgba(var(--f52,142,142,142),1);cursor:not-allowed}.j_2Hd::-webkit-input-placeholder{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);opacity:1}.j_2Hd::-moz-placeholder{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);opacity:1}.j_2Hd:-ms-input-placeholder{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);opacity:1}.j_2Hd::-ms-input-placeholder{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);opacity:1}.j_2Hd::placeholder{color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);opacity:1}.j_2Hd::-ms-clear{display:none;height:0;width:0}.j_2Hd[type=number]::-webkit-inner-spin-button,.j_2Hd[type=number]::-webkit-outer-spin-button{height:auto}.j_2Hd[type=search],.j_2Hd[type=search]::-webkit-search-cancel-button,.j_2Hd[type=search]::-webkit-search-decoration{-webkit-appearance:none}.-wiOT{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border-radius:6px;border:1px solid #dbdbdb;border:1px solid rgba(var(--b38,219,219,219),1);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;padding-right:8px;position:relative}._4eaDf{border:0;padding:4px 9px;width:100%}._4eaDf:focus{outline:0}.FhkBu,._HwM1{border:1px solid #ed4956;border:1px solid rgba(var(--i30,237,73,86),1)}.t-XOq,.cb9Ul{border:1px solid #a8a8a8;border:1px solid rgba(var(--c8c,168,168,168),1)}._4eaDf.t-XOq{border:0}.uIHys,.lC7Ye{border-color:#dbdbdb;border-color:rgba(var(--b38,219,219,219),1);border-radius:1000px}.uIHys{padding-left:20px}.lC7Ye{padding-left:11px}.nqo7i,.QqGAo{border:0}.nqo7i{padding-left:20px}\n.M5V28,.M5V28 *{outline:0!important}\n.B4Y_s{background-size:cover;background-repeat:no-repeat;background-position:center center}\n.lVhHa{position:relative}.yPom5{position:absolute;top:0;left:0;height:100%;width:100%}\n._8KKY4{border:0;padding:4px 9px;width:100%}._8KKY4:focus{outline:0}._8KKY4::-webkit-input-placeholder{opacity:0}._8KKY4::-moz-placeholder{opacity:0}._8KKY4:-ms-input-placeholder{opacity:0}._8KKY4::-ms-input-placeholder{opacity:0}._8KKY4::placeholder{opacity:0}._1jEAS{padding:8px;padding-bottom:0}.Oouko{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;bottom:0;color:#c7c7c7;color:rgba(var(--edc,199,199,199),1);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;font-size:14px;left:0;margin:3px 9px;pointer-events:none;position:absolute;top:0;-webkit-transform-origin:left;transform-origin:left;-webkit-transition:-webkit-transform ease-out .1s;transition:-webkit-transform ease-out .1s;transition:transform ease-out .1s;transition:transform ease-out .1s,-webkit-transform ease-out .1s}.LX_qM{-webkit-transform:scale(.714) translateY(-16px);transform:scale(.714) translateY(-16px)}.OI1cO{background-color:#fafafa;background-color:rgba(var(--b3f,250,250,250),1);border-color:#dbdbdb;border-color:rgba(var(--b38,219,219,219),1);color:#8e8e8e;color:rgba(var(--f52,142,142,142),1);cursor:not-allowed}\n.NcCcD{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;position:relative}.NcCcD .iwQA6{background-color:#fff;background-color:rgba(var(--d87,255,255,255),1);line-height:20px;padding-left:22px}.NcCcD .iwQA6::-webkit-input-placeholder{color:transparent}.NcCcD .iwQA6::-moz-placeholder{color:transparent}.NcCcD .iwQA6:-ms-input-placeholder{color:transparent}.NcCcD .iwQA6::-ms-input-placeholder{color:transparent}.NcCcD .iwQA6::placeholder{color:transparent}.DWAFP{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;bottom:0;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;left:50%;max-width:100%;padding:0 8px;pointer-events:none;position:absolute;top:0;-webkit-transform:translateX(-50%);transform:translateX(-50%);-webkit-transition:left .15s ease-out,-webkit-transform .15s ease-out;transition:left .15s ease-out,-webkit-transform .15s ease-out;transition:left .15s ease-out,transform .15s ease-out;transition:left .15s ease-out,transform .15s ease-out,-webkit-transform .15s ease-out}.DWAFP.RrSJm{left:0;-webkit-transform:translateX(0);transform:translateX(0)}.rwQu7{color:#8e8e8e;color:rgba(var(--f52,142,142,142),1);font-size:14px;font-weight:400;line-height:28px;margin-left:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rKLaY{border:0;background:0 0;padding:0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}\n.-qQT3{cursor:pointer}.-qQT3:active{opacity:1}.-qQT3:hover{background-color:#fafafa;background-color:rgba(var(--b3f,250,250,250),1)}\n.xqRnw{border:0;padding:0;position:absolute;right:4px;top:4px;z-index:1}.N9d2H{background-color:rgba(0,0,0,.8);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}\n.oM3-t{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;margin-left:12px;margin-top:0}@media (min-width:736px){._RI9A{-webkit-box-flex:1;-webkit-flex:1 1 auto;-ms-flex:1 1 auto;flex:1 1 auto}}@media (max-width:735px){._RI9A{-webkit-box-flex:1;-webkit-flex:1 1 0;-ms-flex:1 1 0;flex:1 1 0}}\n@-webkit-keyframes IGCorePill_slideIn{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%)}to{-webkit-transform:translateY(0%);transform:translateY(0%)}}@keyframes IGCorePill_slideIn{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%)}to{-webkit-transform:translateY(0%);transform:translateY(0%)}}.tCibT{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:#fff;background:rgba(var(--f23,255,255,255),1);border:0;border-radius:22px;-webkit-box-shadow:0 10px 45px rgba(0,0,0,.2);box-shadow:0 10px 45px rgba(0,0,0,.2);color:#262626;color:rgba(var(--i1d,38,38,38),1);cursor:pointer;display:block;font-weight:600;outline:inherit;overflow:hidden;text-align:center;text-overflow:ellipsis;text-transform:inherit;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;white-space:nowrap;width:auto;z-index:1000}.tCibT:active,.tCibT:disabled{opacity:.7}.dGjo4{-webkit-animation:IGCorePill_slideIn 300ms ease-in-out;animation:IGCorePill_slideIn 300ms ease-in-out}.qq7_A{background:#0095f6;background:rgba(var(--d69,0,149,246),1);color:#fff;color:rgba(var(--eca,255,255,255),1)}.z4xUb{z-index:1}\n@-webkit-keyframes IGCoreToastShow{0%{opacity:0;-webkit-transform:translate(-50%,-50%) scale(1.5);transform:translate(-50%,-50%) scale(1.5)}to{opacity:.9;-webkit-transform:translate(-50%,-50%) scale(1);transform:translate(-50%,-50%) scale(1)}}@keyframes IGCoreToastShow{0%{opacity:0;-webkit-transform:translate(-50%,-50%) scale(1.5);transform:translate(-50%,-50%) scale(1.5)}to{opacity:.9;-webkit-transform:translate(-50%,-50%) scale(1);transform:translate(-50%,-50%) scale(1)}}@-webkit-keyframes IGCoreToastHide{0%{opacity:.9}to{opacity:0}}@keyframes IGCoreToastHide{0%{opacity:.9}to{opacity:0}}.R8iOs{background-color:#262626;border-radius:8px;left:50%;opacity:0;padding:16px 20px;position:fixed;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-transition:opacity 500ms ease-in-out;transition:opacity 500ms ease-in-out;z-index:1}._7Yp1e{-webkit-animation:IGCoreToastShow 250ms ease-out forwards;animation:IGCoreToastShow 250ms ease-out forwards}.fR6RW{-webkit-animation:IGCoreToastHide 250ms ease-out forwards;animation:IGCoreToastHide 250ms ease-out forwards}\n.iMofo{border-radius:8px;-webkit-box-shadow:rgba(0,0,0,.2) 0 4px 22px;box-shadow:rgba(0,0,0,.2) 0 4px 22px;padding:8px 12px;-webkit-transition:opacity .3s cubic-bezier(.175,.885,.32,1.275),-webkit-transform .3s cubic-bezier(.175,.885,.32,1.275);transition:opacity .3s cubic-bezier(.175,.885,.32,1.275),-webkit-transform .3s cubic-bezier(.175,.885,.32,1.275);transition:opacity .3s cubic-bezier(.175,.885,.32,1.275),transform .3s cubic-bezier(.175,.885,.32,1.275);transition:opacity .3s cubic-bezier(.175,.885,.32,1.275),transform .3s cubic-bezier(.175,.885,.32,1.275),-webkit-transform .3s cubic-bezier(.175,.885,.32,1.275);-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:-webkit-max-content;width:-moz-max-content;width:max-content}.R0tpI{opacity:0;pointer-events:none;-webkit-transform:scale(.5);transform:scale(.5)}.nHGTw{background-color:#ed4956;background-color:rgba(var(--c37,237,73,86),1);color:#fff;color:rgba(var(--eca,255,255,255),1)}.HZ9O2{background-color:#000;background-color:rgba(var(--jb7,0,0,0),1);color:#fff;color:rgba(var(--eca,255,255,255),1)}.LpqwJ{background-color:#fff;background-color:rgba(var(--eca,255,255,255),1);color:#000;color:rgba(var(--jb7,0,0,0),1)}.t1tHE{-webkit-transform-origin:bottom center;transform-origin:bottom center}.nwToI{-webkit-transform-origin:top center;transform-origin:top center}.JxPw3{left:0;position:absolute;width:100%}.pUTym{top:-6px}._0N4Pa{left:35%}.pYXPp{left:-35%}.sHch9{bottom:-6px}._18Jen{border-radius:2px;height:15px;margin:auto;-webkit-transform:rotate(45deg);transform:rotate(45deg);width:15px}.jctW7{-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;font-size:14px;line-height:19px}\n.J_0ip{-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;border-radius:100px;color:#fff;color:rgba(var(--de5,255,255,255),1);font-size:11px;font-weight:semibold;height:18px;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;min-width:18px}.bqXJH{padding:0 3px}.J_0ip.Rlz2P{height:14px;min-width:14px}.J_0ip._46W5R{height:22px;min-width:22px;padding:0 4px}.TKi86{background-color:#ed4956;background-color:rgba(var(--c37,237,73,86),1)}.dJnHt{background-image:-webkit-gradient(linear,right top,left bottom,from(#a307ba),color-stop(#ed4956),to(#fd8d32));background-image:-webkit-linear-gradient(top right,#a307ba,#ed4956,#fd8d32);background-image:linear-gradient(to bottom left,#a307ba,#ed4956,#fd8d32)}\n.BkYbe{border:0}.Y_mhb{border-right:1px solid #dbdbdb;border-right:1px solid rgba(var(--b38,219,219,219),1);padding-left:12px;padding-right:12px}.OZ443{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:0 0;border:0;-webkit-box-sizing:border-box;box-sizing:border-box;cursor:pointer;display:block;font-size:16px;font-weight:600;height:100%;padding:0;text-align:center;text-transform:inherit;text-overflow:ellipsis;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;white-space:nowrap}@media (max-width:735px){.uY-0l{max-height:calc(100vh - 92px)}}@media (min-width:736px){.uY-0l{max-height:288px}.a7-4X.pbNvD{max-height:380px;max-width:360px}}.hF-el{border-top:1px solid #dbdbdb;border-top:1px solid rgba(var(--b38,219,219,219),1)}\n.s4Iyt{max-height:100%;max-width:100%;-o-object-fit:contain;object-fit:contain}\n.uo5MA{background:#fff;background:rgba(var(--d87,255,255,255),1);border-radius:6px;-webkit-box-shadow:0 0 5px 1px rgba(0,0,0,.0975);box-shadow:0 0 5px 1px rgba(0,0,0,.0975);-webkit-box-shadow:0 0 5px 1px rgba(var(--jb7,0,0,0),.0975);box-shadow:0 0 5px 1px rgba(var(--jb7,0,0,0),.0975);position:absolute;z-index:3}.G1z6O{opacity:0;-webkit-transform:translateY(10px);transform:translateY(10px);-webkit-transition:opacity 75ms linear,-webkit-transform 38ms ease-in;transition:opacity 75ms linear,-webkit-transform 38ms ease-in;transition:opacity 75ms linear,transform 38ms ease-in;transition:opacity 75ms linear,transform 38ms ease-in,-webkit-transform 38ms ease-in}.tWgj8{-webkit-transform:translateY(-10px);transform:translateY(-10px)}._2ciX{opacity:1;-webkit-transform:translateY(0);transform:translateY(0);-webkit-transition:opacity 75ms linear,-webkit-transform 38ms ease-out;transition:opacity 75ms linear,-webkit-transform 38ms ease-out;transition:opacity 75ms linear,transform 38ms ease-out;transition:opacity 75ms linear,transform 38ms ease-out,-webkit-transform 38ms ease-out}._01UL2{background:#fff;background:rgba(var(--d87,255,255,255),1);border-radius:6px;height:100%;overflow-x:hidden;overflow-y:auto;position:relative;width:100%}.TOh1s{background:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0)),to(#fff));background:-webkit-linear-gradient(top,rgba(255,255,255,0) 0%,#fff 100%);background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,#fff 100%);background:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0)),to(rgba(var(--f23,255,255,255),1)));background:-webkit-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(var(--f23,255,255,255),1) 100%);background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(var(--f23,255,255,255),1) 100%);border-radius:20px;bottom:0;height:8px;left:0;position:absolute;width:100%}.AvhYw{background:#fff;background:rgba(var(--d87,255,255,255),1);border:1px solid #fff;border:1px solid rgba(var(--f23,255,255,255),1);bottom:-6px;-webkit-box-shadow:0 0 5px 1px rgba(0,0,0,.0975);box-shadow:0 0 5px 1px rgba(0,0,0,.0975);-webkit-box-shadow:0 0 5px 1px rgba(var(--jb7,0,0,0),.0975);box-shadow:0 0 5px 1px rgba(var(--jb7,0,0,0),.0975);height:14px;position:absolute;-webkit-transform:rotate(45deg);transform:rotate(45deg);width:14px}.nLL4f{bottom:0;top:-6px}.XWrBI{-webkit-transform-origin:top center;transform-origin:top center}.WNrPq{-webkit-transform-origin:bottom center;transform-origin:bottom center}\n.wgVJm{bottom:0;left:0;position:fixed;right:0;top:0;z-index:2}\n.KcRNL{border-radius:50%;border-style:solid;border-width:2px;-webkit-box-sizing:content-box;box-sizing:content-box}.mOBkM{border-color:#fff}.-G2e8{border-color:#000}.ucU8P{border-color:transparent}.eti5t{margin-left:-9px}.I3hth{margin-right:-9px}@media (-webkit-min-device-pixel-ratio:2),(min-resolution:2dppx){.KcRNL{border:0}.KcRNL::before{border-radius:50%;border-style:solid;border-width:5px;content:'';height:200%;left:-2.5px;position:absolute;top:-2.5px;-webkit-transform-origin:top left;transform-origin:top left;-webkit-transform:scale(.5);transform:scale(.5);width:200%}.mOBkM::before{border-color:#fff}.-G2e8::before{border-color:#000}.ucU8P::before{border-color:transparent}.Cwehh{margin-left:-4px}.eti5t{margin-left:-5px}.I3hth{margin-right:-5px}}";
  var cssElement = doc.createElement('style');
  cssElement.type = 'text/css';
  cssElement.innerHTML = css;
  doc.getElementsByTagName('head')[0].appendChild(cssElement);
  var html = "\n    <div class=\"RnEpo xpORG _9Mt7n\" role=\"presentation\" style=\"display:none\">\n        <div class=\"xkuux \" style=\"transform: translateY(calc(100vh - 430px)); transition: transform 0.3s ease 0s;\">\n            <div>\n                <div class=\"rZ_Tm\">\n                    <div class=\"BHY8D\"></div>\n                </div>\n            </div>\n            <div class=\"YkJYY\" style=\"height: 395px;\">\n                <div>\n                    <div class=\"eiUFA\">\n                        <div class=\"WaOAr\"></div>\n                        <h1 class=\"m82CD\">Compartir</h1>\n                        <div class=\"WaOAr\"></div>\n                    </div>\n                </div>\n                <div class=\"Igw0E     IwRSH      eGOV_ vwCYk lDRO1\">\n                    <div class=\"Igw0E     IwRSH      eGOV_ _4EzTm HVWg4\">\n                        <div class=\"-qQT3\" role=\"button\" tabIndex=\"0\">\n                            <div aria-labelledby=\"f2366655318dbdc f1df9dc190a4d64\"\n                                 class=\"Igw0E   rBNOH        eGOV_     ybXk5    _4EzTm XfCBB HVWg4\">\n                                <div\n                                    class=\"Igw0E     IwRSH      eGOV_         _4EzTm yC0tu\">\n                                    <div class=\"_NyRp\"></div>\n                                </div>\n                                <div\n                                    class=\"Igw0E     IwRSH        YBx95      vwCYk\">\n                                    <div\n                                        class=\"Igw0E     IwRSH      eGOV_         _4EzTm\"\n                                        id=\"f2366655318dbdc\">\n                                        <div class=\"_7UhW9   xLCgt      MMzan  KV-D4 fDxYl\">\n                                            <div\n                                                class=\"_7UhW9   xLCgt       qyrsm uL8Hv\">Cancelar\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    ";
  var div = doc.createElement('div');
  div.innerHTML = html;
  doc.body.appendChild(div);
  var cancelButton = doc.querySelector("._7UhW9.xLCgt.qyrsm.uL8Hv");
  cancelButton.addEventListener("click", dismiss, false);
  cancelButton.addEventListener("tap", dismiss, false);
  var liveAnchorElement = doc.querySelector('.blog-posts') || doc;
  if (liveAnchorElement) addLiveEventListeners(liveAnchorElement, '.mobile .NG_post_date_cat', 'click', show);else addLiveEventListeners(doc, '.mobile .NG_post_date_cat', 'click', show);
  //doc.querySelector("._7UhW9.xLCgt.qyrsm.uL8Hv").addEventListener("tap", dismiss, false);
  var containerClass = '.xkuux';
  var containerElement = doc.querySelector(containerClass);
  containerElement.addEventListener("tap", dismiss, false);
  var draggableElement = doc.querySelector('.RnEpo');
  if (win.location.search.match(/[?&]drag=0/)) return;
  var initialTop = null;
  var direction = 'none';
  var lastTop = null;
  var initialY = 0;
  var lastTranslateYPixel = null;
  var initialInnerHeight = 0;
  var orientationDevice = '';
  var scrollingAllowed = false;
  function initVars(event) {
    var viewportOffset = containerElement.getBoundingClientRect();
    initialTop = viewportOffset.top;
    initialY = event.changedTouches[0].clientY;
    initialInnerHeight = win.innerHeight;
    orientationDevice = getOrientation();
    (0, _log.cLog)("ORIENTATION IS: ", orientationDevice);
    if (orientationDevice === 'vertical') {
      (0, _log.cLog)("Disabling scroll");
      scrollingAllowed = false;
      disableScroll();
    } else {
      (0, _log.cLog)("Enabling scroll");
      scrollingAllowed = true;
      enableScroll();
    }
  }
  draggableElement.addEventListener('touchstart', function (event) {
    if (initialTop === null) {
      if (typeof containerElement === 'undefined') return;
      initVars(event);
    } else if (getOrientation() !== orientationDevice) initVars(event);
    (0, _log.cLog)("START", event);
  });
  draggableElement.addEventListener('touchmove', function (event) {
    if (!event.target || event.target.className !== 'rZ_Tm' && event.target.nodeName !== 'H1') {
      (0, _log.cLog)("Ignoring target", event.target);
      return;
    }
    event.preventDefault();
    if (typeof containerElement === 'undefined') return;
    var value;
    if (event.changedTouches[0].clientY < initialY) {
      value = initialY - (initialY - event.changedTouches[0].clientY);
      direction = 'up';
    } else {
      value = initialY + (event.changedTouches[0].clientY - initialY);
      direction = 'down';
    }
    value += initialInnerHeight - win.innerHeight;
    if (lastTranslateYPixel === null) lastTranslateYPixel = value;
    if (lastTranslateYPixel - value < -10 || lastTranslateYPixel - value >= 10) {
      // condition to do it is ok.
      (0, _log.cLog)("Condition is ok: ", lastTranslateYPixel, value);
    } else {
      return;
    }
    lastTranslateYPixel = value;
    containerElement.style.transform = "translateY(" + value.toString() + "px)";
    (0, _log.cLog)("Applying style: direction:  ", direction, containerElement.style.transform, event);
  });
  draggableElement.addEventListener('touchend', function (event) {
    lastTranslateYPixel = null;
    if (direction === 'up' && getOrientation() === 'vertical') {
      var value = parseInt(initialTop.toString());
      lastTop = parseInt(initialTop.toString());
      containerElement.style.transform = "translateY(" + value.toString() + "px)";
      (0, _log.cLog)("Applying style direction up: ", containerElement.style.transform);
      lastTop = parseInt(initialTop.toString());
      direction = 'none';
    }
    if (direction === 'down') {
      var _value;
      if (event.changedTouches[0].clientY > screen.height / 2) {
        initialTop = null;
        initialY = 0;
        initialInnerHeight = 0;
        if (!scrollingAllowed) enableScroll();
        dismiss({
          target: cancelButton
        });
      } else {
        if (event.changedTouches[0].clientY < initialY) {
          _value = initialY - (initialY - event.changedTouches[0].clientY);
          direction = 'up';
        } else {
          _value = initialY + (event.changedTouches[0].clientY - initialY);
          direction = 'down';
        }
        containerElement.style.transform = "translateY(" + _value.toString() + "px)";
      }
    }
    (0, _log.cLog)("TOUCH_END", event);
  });
}
function getOrientation() {
  if (win.innerHeight > win.innerWidth) return 'vertical';
  return 'horizontal';
}

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1
};
function preventDefault(e) {
  e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  win.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function get() {
      supportsPassive = true;
    }
  }));
} catch (e) {}
var wheelOpt = supportsPassive ? {
  passive: false
} : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  win.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  win.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  win.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  win.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
  win.removeEventListener('DOMMouseScroll', preventDefault, false);
  win.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  win.removeEventListener('touchmove', preventDefault, wheelOpt);
  win.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
function calcTranslateYValue(value) {
  var base = win.innerHeight > win.innerWidth ? win.innerHeight : win.innerWidth;
  return base - value;
}

},{"./dom/htmlEntities":5,"./log/log":8}],10:[function(require,module,exports){
"use strict";

var _sharer = require("./sharer");
var _shadowDOM = require("./browser/shadowDOM");
var _device = require("./browser/device");
var _log = require("./log/log");
var _isMobile = require("./dom/isMobile");
var _viewport = require("./dom/viewport");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
var scripts = document.querySelectorAll('script');
var iOS = isMobile.isIOS();
var Android = !!navigator.userAgent && /Android/.test(navigator.userAgent);
(0, _log.cLog)("SCRIPTS:", scripts);
function getVidAdTagURL() {
  return '//pubads.g.doubleclick.net/gampad/ads?sz=#WxH#&iu=' + top.ampliffyTVVideoBlogAdUnit + '_VidAd_Lis_MC_AUTO&ciu_szs&impl=s&gdfp_req=1&env=vp&output=xml_vast3&unviewed_position_start=1&url=__page-url__&description_url=__item-description__&correlator=__timestamp__&cust_params=keyword%3Dampvidplayerpost__fbfan__,__item-category__%26title%3D__item-title__%26description%3D__item-description__%26file%3D__item-file__';
}
if (typeof top.ampVideoBlogProcessed === 'undefined' || !top.ampVideoBlogProcessed) {
  var getFirstPost = function getFirstPost(doc) {
    return typeof top.pageType === 'string' && top.pageType === 'item' && doc.querySelector('div#content div.post div.post-body');
  };
  var getHTMElementByElement = function getHTMElementByElement(element) {
    if (!element.playerStorage) checkPlayerStorage(element, element.id);
    if (element.playerStorage.anchorElement && element.playerStorage.anchorElement.id === element.id) return element.playerStorage.anchorElement;
    return (element.playerStorage.shadowRoot || doc).querySelector('div#' + element.id);
  };
  var removeVideoFromTheDOM = function removeVideoFromTheDOM(elementId) {
    var element = elements[elementId];
    if (!element.playerStorage) checkPlayerStorage(element, element.id);
    var el = getHTMElementByElement(element).parentElement.parentElement.parentElement.querySelector('#super' + elementId);
    if (!el) {
      (0, _log.cLog)("removeVideoFromTheDOM: Unable to find #super" + elementId);
      return;
    }
    el.remove();
  };
  var addVideoToTheDOM = function addVideoToTheDOM(elementId, itemAnchor) {
    var rootElement, b;
    // Avoid jumps
    if (itemAnchor.clientHeight) {
      var heightByAspectRatio = Math.floor(itemAnchor.clientWidth * 0.5625);
      var _getDeviceSizeOrienta = (0, _device.getDeviceSizeOrientationAware)(),
        screenHeight = _getDeviceSizeOrienta.screenHeight;
      var clientHeight = itemAnchor.style.height !== '' ? itemAnchor.clientHeight : 0; // Keep forced Height
      itemAnchor.style.height = Math.min(screenHeight, Math.max(clientHeight, heightByAspectRatio)) + 'px';
      itemAnchor.style.maxWidth = '100vw';
      itemAnchor.style.maxHeight = '100vh';
      itemAnchor.style.overflow = 'hidden';
    }
    if (useShadowRoot) {
      if (!itemAnchor.shadowRoot) itemAnchor.attachShadow({
        mode: 'open'
      });
      var h = itemAnchor.shadowRoot.querySelector('html') || doc.createElement('html');
      var he = itemAnchor.shadowRoot.querySelector('head') || doc.createElement('head');
      if (!h.querySelector('head')) h.appendChild(he);
      b = itemAnchor.shadowRoot.querySelector('body') || doc.createElement('body');
      if (!h.querySelector('body')) h.appendChild(b);
      if (!itemAnchor.shadowRoot.querySelector('html')) itemAnchor.shadowRoot.appendChild(h);
      rootElement = itemAnchor.shadowRoot;
    } else {
      b = itemAnchor;
      rootElement = itemAnchor;
    }
    var sup = doc.createElement('div');
    sup.id = 'super' + elementId;
    sup.className = 'vid-iframe-parent';
    sup.style.display = "none";
    b.appendChild(sup);
    var div = doc.createElement('div');
    div.id = 'parent' + elementId;
    sup.appendChild(div);
    var iframe = doc.createElement(useShadowRoot ? 'div' : 'iframe');
    iframe.id = elementId;
    iframe.className = 'vid-iframe-amp';
    div.appendChild(iframe);
    if (useShadowRoot) {
      var iframeDiv = doc.createElement('div');
      iframeDiv.className = 'vid-iframe-amp-inner';
      iframeDiv.style.position = 'relative';
      iframe.appendChild(iframeDiv);
    }
    (0, _log.cLog)("Loaded!");
    top.ampliffyTVVideoBlog = undefined;
    top.css = phases['phase-css'];
    top.phase2 = phases['phase-2'];
    top.phase3 = phases['phase-3'];
    top.comScore6 = phases['phase-comscore6'];
    if (useShadowRoot) {
      var phase1Script = doc.createElement('script');
      phase1Script.id = 'vid-script-amp';
      phase1Script.src = phases['phase-1'];
      (0, _log.cLog)("Video Blog Loaded! ", b, phase1Script);
      if (top.ampTV.ampPhase1) top.ampTV.ampPhase1(useShadowRoot ? itemAnchor : iframe);else {
        phase1Script.onload = function (configID) {
          top.ampTV.ampPhase1(configID);
        }.bind(useShadowRoot ? window : iframe.contentWindow, useShadowRoot ? itemAnchor : iframe);
        b.appendChild(phase1Script);
      }
    } else {
      iframe.width = b.clientWidth;
      iframe.height = b.clientWidth / 16 * 9;
      setTimeout(function (iframe, elementId) {
        var doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
        doc.open();
        doc.write('<div style="display:inline"><style type="text/css">body {margin:0} .vjs-remaining-time {display:none} </style>\n' + '<script>\n' + "window.css = '" + phases['phase-css'] + "';\nwindow.phase2 = '" + phases['phase-2'] + "';\nwindow.phase3 = '" + phases['phase-3'] + "';\nwindow.comScore6 = '" + phases['phase-comscore6'] + "';" + '<' + '/script>\n' + '<script src="' + phases['phase-1'] + '">\n' + '<' + '/script></div>');
        doc.close();
        (0, _log.cLog)("Attached iframe", elementId, iframe);
      }.bind(null, iframe, elementId), 1000);
    }
  };
  var addNewVidAfToDOM = function addNewVidAfToDOM(configId) {
    var idForNewVideo = configId;
    var itemAnchor;
    if (typeof elements[configId].vidAfConfig !== 'undefined') {
      var vidAfConfigElement = elements[configId].vidAfConfig;
      if (vidAfConfigElement.infiniteDynamicPageConfiguration && vidAfConfigElement.infiniteDynamicPageConfiguration.anchorElementId) itemAnchor = doc.getElementById(vidAfConfigElement.infiniteDynamicPageConfiguration.anchorElementId);
    }
    if (!itemAnchor) {
      var elementById = doc.getElementById(idForNewVideo);
      itemAnchor = elementById ? elementById : genericAnchor;
    }
    (0, _log.cLog)('addVideoToTheDOM(', idForNewVideo, itemAnchor, ')');
    top.ampTV.rootDocument = undefined;
    setTimeout(function () {
      addVideoToTheDOM(idForNewVideo, itemAnchor);
    }, 10);
  };
  top.ampVideoBlogProcessed = true;
  var useShadowRoot = (0, _shadowDOM.isShadowDOMAvailable)();
  try {
    top.ampTV = top.ampTV || {};
    if (typeof top.ampTV.getElementById === 'undefined') top.ampTV.getElementById = function (ampTV, id) {
      if (!id) return null;
      var playerStorage = ampTV.getConfigById(id);
      if (!playerStorage) {
        if (id.match(/^content_video-/)) {
          playerStorage = ampTV.getConfigById(id.substr(14));
        }
      }
      if (!playerStorage) return null;
      return playerStorage.shadowRoot.querySelector('#' + id);
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.instances === 'undefined') top.ampTV.instances = [];
    if (typeof top.ampTV.addConfig === 'undefined') top.ampTV.addConfig = function (ampTV, anchorElement, data) {
      if (!anchorElement) return;
      if (!data) return;
      var useShadowRoot = (0, _shadowDOM.isShadowDOMAvailable)();
      var shadowRoot = useShadowRoot ? anchorElement.shadowRoot : anchorElement.contentDocument ? anchorElement.contentDocument : anchorElement;
      (0, _log.cLog)("Loaded! addConfig", anchorElement, shadowRoot, data);
      var instance = {
        anchorElement: anchorElement,
        shadowRoot: shadowRoot,
        data: data,
        id: anchorElement.id
      };
      // We remove old instances
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.anchorElement !== anchorElement;
      });
      // And add the new instance
      ampTV.instances.push(instance);
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.getConfigByElement === 'undefined') top.ampTV.getConfigByElement = function (ampTV, anchorElement) {
      if (!anchorElement) return;
      var instance = ampTV.instances.find(function (x) {
        return x.anchorElement === anchorElement;
      });
      if (!instance) return;
      return instance;
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.getConfigById === 'undefined') top.ampTV.getConfigById = function (ampTV, id) {
      if (!id) return;
      var instance = ampTV.instances.find(function (x) {
        return x.id === id;
      });
      if (!instance) return;
      return instance;
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.deleteConfigByElement === 'undefined') top.ampTV.deleteConfigByElement = function (ampTV, anchorElement) {
      if (!anchorElement) return;
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.anchorElement !== anchorElement;
      });
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.deleteConfigById === 'undefined') top.ampTV.deleteConfigById = function (ampTV, id) {
      if (!id) return;
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.id !== id;
      });
    }.bind(top, top.ampTV);
    var isDev = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
    if (!top.ampTV.css && window.css) top.ampTV.css = window.css;
    if (!top.ampTV.phase1) top.ampTV.phase1 = window.phase1;
    if (!top.ampTV.phase2) top.ampTV.phase2 = window.phase2;
    if (!top.ampTV.phase3) top.ampTV.phase3 = window.phase3;
    var devURL = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA';
    try {
      if (isDev) {
        top.ampTV.css = devURL + '.css?';
        top.ampTV.phase1 = devURL + '_FASE1.js?';
        top.ampTV.phase2 = devURL + '_FASE2.js?';
        top.ampTV.phase3 = devURL + '_FASE3.js?';
      }
    } catch (e) {}
  } catch (e) {
    console.error("Cannot setup ATV", e);
  }

  // Polyfill to allow smooth scroll in iOS
  (function () {
    'use strict';

    // polyfill
    function polyfill(w, d) {
      // return if scroll behavior is supported and polyfill is not forced
      if ('scrollBehavior' in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
        return;
      }

      // globals
      var Element = w.HTMLElement || w.Element;
      var SCROLL_TIME = 468;

      // object gathering original scroll methods
      var original = {
        scroll: w.scroll || w.scrollTo,
        scrollBy: w.scrollBy,
        elementScroll: Element.prototype.scroll || scrollElement,
        scrollIntoView: Element.prototype.scrollIntoView
      };

      // define timing method
      var now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;

      /**
       * indicates if a the current browser is made by Microsoft
       * @method isMicrosoftBrowser
       * @param {String} userAgent
       * @returns {Boolean}
       */
      function isMicrosoftBrowser(userAgent) {
        var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];
        return new RegExp(userAgentPatterns.join('|')).test(userAgent);
      }

      /*
       * IE has rounding bug rounding down clientHeight and clientWidth and
       * rounding up scrollHeight and scrollWidth causing false positives
       * on hasScrollableSpace
       */
      var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

      /**
       * changes scroll position inside an element
       * @method scrollElement
       * @param {Number} x
       * @param {Number} y
       * @returns {undefined}
       */
      function scrollElement(x, y) {
        this.scrollLeft = x;
        this.scrollTop = y;
      }

      /**
       * returns result of applying ease math function to a number
       * @method ease
       * @param {Number} k
       * @returns {Number}
       */
      function ease(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
      }

      /**
       * indicates if a smooth behavior should be applied
       * @method shouldBailOut
       * @param {Number|Object} firstArg
       * @returns {Boolean}
       */
      function shouldBailOut(firstArg) {
        if (firstArg === null || _typeof(firstArg) !== 'object' || firstArg.behavior === undefined || firstArg.behavior === 'auto' || firstArg.behavior === 'instant') {
          // first argument is not an object/null
          // or behavior is auto, instant or undefined
          return true;
        }
        if (_typeof(firstArg) === 'object' && firstArg.behavior === 'smooth') {
          // first argument is an object and behavior is smooth
          return false;
        }

        // throw error when behavior is not supported
        throw new TypeError('behavior member of ScrollOptions ' + firstArg.behavior + ' is not a valid value for enumeration ScrollBehavior.');
      }

      /**
       * indicates if an element has scrollable space in the provided axis
       * @method hasScrollableSpace
       * @param {Node} el
       * @param {String} axis
       * @returns {Boolean}
       */
      function hasScrollableSpace(el, axis) {
        if (axis === 'Y') {
          return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
        }
        if (axis === 'X') {
          return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
        }
      }

      /**
       * indicates if an element has a scrollable overflow property in the axis
       * @method canOverflow
       * @param {Node} el
       * @param {String} axis
       * @returns {Boolean}
       */
      function canOverflow(el, axis) {
        var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];
        return overflowValue === 'auto' || overflowValue === 'scroll';
      }

      /**
       * indicates if an element can be scrolled in either axis
       * @method isScrollable
       * @param {Node} el
       * @param {String} axis
       * @returns {Boolean}
       */
      function isScrollable(el) {
        var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
        var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');
        return isScrollableY || isScrollableX;
      }

      /**
       * finds scrollable parent of an element
       * @method findScrollableParent
       * @param {Node} el
       * @returns {Node} el
       */
      function findScrollableParent(el) {
        while (el !== d.body && isScrollable(el) === false) {
          el = el.parentNode || el.host;
        }
        return el;
      }

      /**
       * self invoked function that, given a context, steps through scrolling
       * @method step
       * @param {Object} context
       * @returns {undefined}
       */
      function step(context) {
        var time = now();
        var value;
        var currentX;
        var currentY;
        var elapsed = (time - context.startTime) / SCROLL_TIME;

        // avoid elapsed times higher than one
        elapsed = elapsed > 1 ? 1 : elapsed;

        // apply easing to elapsed time
        value = ease(elapsed);
        currentX = context.startX + (context.x - context.startX) * value;
        currentY = context.startY + (context.y - context.startY) * value;
        context.method.call(context.scrollable, currentX, currentY);

        // scroll more if we have not reached our destination
        if (currentX !== context.x || currentY !== context.y) {
          w.requestAnimationFrame(step.bind(w, context));
        }
      }

      /**
       * scrolls window or element with a smooth behavior
       * @method smoothScroll
       * @param {Object|Node} el
       * @param {Number} x
       * @param {Number} y
       * @returns {undefined}
       */
      function smoothScroll(el, x, y) {
        var scrollable;
        var startX;
        var startY;
        var method;
        var startTime = now();

        // define scroll context
        if (el === d.body) {
          scrollable = w;
          startX = w.scrollX || w.pageXOffset;
          startY = w.scrollY || w.pageYOffset;
          method = original.scroll;
        } else {
          scrollable = el;
          startX = el.scrollLeft;
          startY = el.scrollTop;
          method = scrollElement;
        }

        // scroll looping over a frame
        step({
          scrollable: scrollable,
          method: method,
          startTime: startTime,
          startX: startX,
          startY: startY,
          x: x,
          y: y
        });
      }

      // ORIGINAL METHODS OVERRIDES
      // w.scroll and w.scrollTo
      w.scroll = w.scrollTo = function () {
        // avoid action when no arguments are passed
        if (arguments[0] === undefined) {
          return;
        }

        // avoid smooth behavior if not required
        if (shouldBailOut(arguments[0]) === true) {
          original.scroll.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : w.scrollX || w.pageXOffset,
          // use top prop, second argument if present or fallback to scrollY
          arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : w.scrollY || w.pageYOffset);
          return;
        }

        // LET THE SMOOTHNESS BEGIN!
        smoothScroll.call(w, d.body, arguments[0].left !== undefined ? ~~arguments[0].left : w.scrollX || w.pageXOffset, arguments[0].top !== undefined ? ~~arguments[0].top : w.scrollY || w.pageYOffset);
      };

      // w.scrollBy
      w.scrollBy = function () {
        // avoid action when no arguments are passed
        if (arguments[0] === undefined) {
          return;
        }

        // avoid smooth behavior if not required
        if (shouldBailOut(arguments[0])) {
          original.scrollBy.call(w, arguments[0].left !== undefined ? arguments[0].left : _typeof(arguments[0]) !== 'object' ? arguments[0] : 0, arguments[0].top !== undefined ? arguments[0].top : arguments[1] !== undefined ? arguments[1] : 0);
          return;
        }

        // LET THE SMOOTHNESS BEGIN!
        smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
      };

      // Element.prototype.scroll and Element.prototype.scrollTo
      Element.prototype.scroll = Element.prototype.scrollTo = function () {
        // avoid action when no arguments are passed
        if (arguments[0] === undefined) {
          return;
        }

        // avoid smooth behavior if not required
        if (shouldBailOut(arguments[0]) === true) {
          // if one number is passed, throw error to match Firefox implementation
          if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
            throw new SyntaxError('Value could not be converted');
          }
          original.elementScroll.call(this,
          // use left prop, first number argument or fallback to scrollLeft
          arguments[0].left !== undefined ? ~~arguments[0].left : _typeof(arguments[0]) !== 'object' ? ~~arguments[0] : this.scrollLeft,
          // use top prop, second argument or fallback to scrollTop
          arguments[0].top !== undefined ? ~~arguments[0].top : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop);
          return;
        }
        var left = arguments[0].left;
        var top = arguments[0].top;

        // LET THE SMOOTHNESS BEGIN!
        smoothScroll.call(this, this, typeof left === 'undefined' ? this.scrollLeft : ~~left, typeof top === 'undefined' ? this.scrollTop : ~~top);
      };

      // Element.prototype.scrollBy
      Element.prototype.scrollBy = function () {
        // avoid action when no arguments are passed
        if (arguments[0] === undefined) {
          return;
        }

        // avoid smooth behavior if not required
        if (shouldBailOut(arguments[0]) === true) {
          original.elementScroll.call(this, arguments[0].left !== undefined ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== undefined ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
          return;
        }
        this.scroll({
          left: ~~arguments[0].left + this.scrollLeft,
          top: ~~arguments[0].top + this.scrollTop,
          behavior: arguments[0].behavior
        });
      };

      // Element.prototype.scrollIntoView
      Element.prototype.scrollIntoView = function () {
        // avoid smooth behavior if not required
        if (shouldBailOut(arguments[0]) === true) {
          original.scrollIntoView.call(this, arguments[0] === undefined ? true : arguments[0]);
          return;
        }

        // LET THE SMOOTHNESS BEGIN!
        var scrollableParent = findScrollableParent(this);
        var parentRects = scrollableParent.getBoundingClientRect();
        var clientRects = this.getBoundingClientRect();
        if (scrollableParent !== d.body) {
          // reveal element inside parent
          smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);

          // reveal parent in viewport unless is fixed
          if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
            w.scrollBy({
              left: parentRects.left,
              top: parentRects.top,
              behavior: 'smooth'
            });
          }
        } else {
          // reveal element in viewport
          w.scrollBy({
            left: clientRects.left,
            top: clientRects.top,
            behavior: 'smooth'
          });
        }
      };
    }

    // global
    polyfill(window, document);
    polyfill(top, top.document);
  })();
  // End of polyfill to allow smooth scroll in iOS

  var analyzeScripts = function analyzeScripts(scripts) {
    var ret = {};
    scripts.forEach(function (x) {
      if (!x.className || !x.className.match(/^phase-/)) return;
      var className = x.className.split(/ /)[0];
      ret[className] = x.src;
    });
    if (top.ampTV.phase1) ret['phase-1'] = top.ampTV.phase1;
    if (typeof ret["phase-1"] === 'undefined') {
      scripts.forEach(function (x) {
        if (x.className || !x.src || !x.src.length) return;
        ret['phase-1'] = x.src;
      });
    }
    if (typeof ret["phase-2"] === 'undefined' && top.ampTV.phase2) ret['phase-2'] = top.ampTV.phase2;
    if (typeof ret["phase-3"] === 'undefined' && top.ampTV.phase3) ret['phase-3'] = top.ampTV.phase3;
    if (typeof ret["phase-css"] === 'undefined' && top.ampTV.css) ret['phase-css'] = top.ampTV.css;
    if (typeof ret["phase-video-blog"] === 'undefined' && top.ampTV.videoBlogURL) ret['phase-video-blog'] = top.ampTV.videoBlogURL;
    if (typeof ret["phase-comscore6"] === 'undefined' && top.ampTV.comscore6) ret['phase-comscore6'] = top.ampTV.comscore6;
    return ret;
  };
  var phases = analyzeScripts(scripts);
  (0, _log.cLog)("SCRIPTS: Phases", phases);
  if (typeof top.frameElementVideo !== 'undefined') top.frameElementVideo.style.display = 'none';
  var win = top,
    doc = win.document;
  (0, _sharer.buildSharer)(doc);
  var vidCoAdUnit = typeof top.ampliffyTVVideoBlogAdUnit !== 'undefined' && (typeof top.ampliffyTVVideoBlogAdUnitVidCoDebug !== 'boolean' || !top.ampliffyTVVideoBlogAdUnitVidCoDebug) ? top.ampliffyTVVideoBlogAdUnit + '_VidCo_Lis_MC_AUTO' : '/43606300/Ampliffy_Ampliffy_Dir_Des_VidCo_Lis_MC_AUTO';
  var defaultVidAfConfig1 = {};
  var elements = {};
  var firstPost = getFirstPost(doc);
  if (firstPost) firstPost.classList.add('landing_main_post');
  var checkInitializedElement = function checkInitializedElement(id) {
    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (typeof elements[id] === 'undefined') elements[id] = {
      initialized: false,
      id: id,
      disposed: false,
      startedVidCo: false,
      ignoreByErrors: false
    };else if (force) {
      elements[id].disposed = false;
      elements[id].initialized = false;
      elements[id].startedVidCo = false;
    }
  };
  var setInitializedElement = function setInitializedElement(id) {
    checkInitializedElement(id);
    elements[id].initialized = performance.now();
    if (typeof elements[id].onInitialized !== 'undefined' && elements[id].onInitialized.length) elements[id].onInitialized.forEach(function (x) {
      return x();
    });
    var el = getHTMElementByElement(elements[id]);
    if (!el) {
      (0, _log.cLog)("Unknown iframe element with id " + id);
      return;
    }
    if (!elements[id].playerStorage) checkPlayerStorage(elements[id], id);
    if (!elements[id].playerStorage) return;
    var player = elements[id].playerStorage.data.player;
    if (!player) return;
    var disableMuteSwitchUntil = null;
    player.player_.options_.disableTechClick = function () {
      (0, _log.cLog)("TechClick", disableMuteSwitchUntil, performance.now() < disableMuteSwitchUntil);
      if (disableMuteSwitchUntil && performance.now() < disableMuteSwitchUntil) return true;
      disableMuteSwitchUntil = performance.now() + 300;
      var muted = !player.muted();
      player.muted(muted);
      return true; // We disable the behaviour of pausing/resuming the playback
    };

    player.player_.options_.disableTechTap = function () {
      (0, _log.cLog)("TechTap", disableMuteSwitchUntil, performance.now() < disableMuteSwitchUntil);
      if (disableMuteSwitchUntil && performance.now() < disableMuteSwitchUntil) return false;
      disableMuteSwitchUntil = performance.now() + 300;
      var muted = !player.muted();
      player.muted(muted);
      return false; // We keep the current behaviour of showing/hiding the controls
    };
  };

  var hideChildLinks = function hideChildLinks(el) {
    var applyRecursively = function applyRecursively(el) {
      (0, _log.cLog)("hideChildLinks", el);
      [].forEach.call(el.childNodes, function (x) {
        return x.tagName === 'A' ? x.style.display = 'none' : null;
      });
      [].forEach.call(el.childNodes, function (x) {
        return x.tagName === 'DIV' ? x.style.display = '' : null;
      });
      [].forEach.call(el.childNodes, function (x) {
        return x.shadowRoot && x.shadowRoot.querySelector('body') && applyRecursively(x.shadowRoot.querySelector('body'));
      });
      if (el.shadowRoot && el.shadowRoot.querySelector('body')) applyRecursively(el.shadowRoot.querySelector('body'));
    };
    applyRecursively(el);
    if (el && el.parentElement && el.parentElement.parentElement && el.parentElement.parentElement.parentElement) {
      var _firstPost = getFirstPost(doc);
      var anchor = el.parentElement.parentElement.parentElement;
      if (!_firstPost || !_firstPost.contains(el)) {
        anchor.querySelectorAll('.NG_area_image .NG_title_post a').forEach(function (x) {
          return Object.assign(x.style, {
            display: 'none',
            height: '0px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            marginTop: '8px'
          });
        });
        anchor.querySelectorAll('.NG_bckg_info').forEach(function (x) {
          return (x.style.pointerEvents = 'none') && (x.style.display = 'none');
        });
      } else {
        anchor.querySelectorAll('.NG_bckg_info').forEach(function (x) {
          return (x.style.pointerEvents = 'auto') && (x.style.display = 'block');
        });
      }
    }
  };
  var restoreChildLinks = function restoreChildLinks(el) {
    var heightToKeep = el.clientHeight;
    if (heightToKeep) {
      el.style.height = heightToKeep + 'px';
    }
    var applyRecursively = function applyRecursively(el) {
      (0, _log.cLog)("restoreChildLinks", el);
      [].forEach.call(el.childNodes, function (x) {
        return x.tagName === 'A' ? x.style.display = '' : null;
      });
      [].forEach.call(el.childNodes, function (x) {
        return x.tagName === 'DIV' ? x.style.display = 'none' : null;
      });
      [].forEach.call(el.childNodes, function (x) {
        return x.shadowRoot && x.shadowRoot.querySelector('body') && applyRecursively(x.shadowRoot.querySelector('body'));
      });
      if (el.shadowRoot && el.shadowRoot.querySelector('body')) applyRecursively(el.shadowRoot.querySelector('body'));
    };
    applyRecursively(el);
  };
  var addNewVidAfVideo = function addNewVidAfVideo(x) {
    if (typeof x.processed === 'boolean' && !x.processed) return;
    var el = x.anchorPoint;
    if (!el) {
      (0, _log.cLog)('Ignoring id:' + x.id + ' => Unable to find document.querySelector(\'div[data-post-id="' + x.id + '"] .NG_area_image\')', x);
      return;
    }
    x.processed = true;
    var id = 'vid-iframe-' + el.id;
    checkInitializedElement(id, true);
    elements[id].reference = x;
    elements[id].onInitialized = elements[id].onInitialized || [];
    elements[id].onInitialized.push(hideChildLinks.bind(null, el));
    elements[id].onDispose = elements[id].onDispose || [];
    elements[id].onDispose.push(restoreChildLinks.bind(null, el));
    elements[id].onDispose.push(removeVideoFromTheDOM.bind(null, id));
    elements[id].onDispose.push(function (x) {
      return x.onInitialized.splice(0);
    }.bind(null, elements[id]));
    elements[id].vidAfConfig = {
      infiniteDynamicPageConfiguration: {
        anchorElementId: el.id
      },
      playListKWs: [x.media.ID],
      playList: {
        items: [{
          thumbnail: [{
            src: x.media.params.t
          }],
          sources: {
            first15: x.media.params.s,
            ytVideoId: x.media.ID,
            vidCoAdUnit: vidCoAdUnit
          }
        }]
      }
    };
    var link = el.querySelector('a');
    if (link && link.href) elements[id].vidAfConfig.playList.items[0].linkTo = link.href.replace(/^http:\/\//, 'https://');
    addNewVidAfToDOM(id);
  };
  var timerAddToVidAf = 0;
  var pendingAddingToVidAf = [];
  var fillAnchorForVidAf = function fillAnchorForVidAf(vidAf) {
    var anchor = doc.querySelector('div[data-post-id="' + vidAf.id + '"] .NG_area_image');
    vidAf.anchorPoint = anchor;

    // We don't want to change anything from the first post in the landing. We detect it through the div.comments div.
    var firstPost = getFirstPost(doc);
    var post = doc.querySelector('div[data-post-id="' + vidAf.id + '"]');
    if (!firstPost || !firstPost.contains(post)) {
      if (post && !post.querySelector('.title-post-amp')) {
        var title = post.querySelector('.NG_title_post');
        if (title) {
          var newDiv = doc.createElement('div');
          newDiv.className = 'NG_title_post title-post-amp title-post-' + (iOS || Android ? 'mobile' : 'desktop');
          newDiv.innerHTML = title.innerHTML;
          post.insertBefore(newDiv, post.firstElementChild);
        }
      }
    }
  };
  var getNearestVidAf = function getNearestVidAf(pendingAddingToVidAf) {
    var minDistance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4000;
    var minDistanceIndex;
    pendingAddingToVidAf.forEach(function (x, i) {
      if (!x || !x.anchorPoint) return;
      var rect = x.anchorPoint.getBoundingClientRect();
      if (Math.abs(rect.top - 50) < minDistance) {
        minDistance = Math.abs(rect.top);
        minDistanceIndex = i;
      }
    });
    // noinspection JSUnusedAssignment
    return minDistanceIndex;
  };
  var queueVidAfProcessing = function queueVidAfProcessing(x) {
    (0, _log.cLog)("New vidAfVideo", x);
    if (timerAddToVidAf) {
      fillAnchorForVidAf(x);
      pendingAddingToVidAf.push(x);
    } else {
      fillAnchorForVidAf(x);
      //console.log("Trying to add new item: ",x,x.anchorPoint);
      addNewVidAfVideo(x); // First one is immediate, we setup a timer just in case there are new arrivals
      timerAddToVidAf = setInterval(function () {
        var index = getNearestVidAf(pendingAddingToVidAf);
        //console.log("interval trying to add new item: ",pendingAddingToVidAf,index);
        if (index === undefined) return;
        var items = pendingAddingToVidAf.splice(index, 1);
        if (items.length) {
          fillAnchorForVidAf(items[0]);
          //console.log("Trying to add new item (pending): ",items[0]);
          addNewVidAfVideo(items[0]);
        }
        if (!pendingAddingToVidAf.length) {
          clearInterval(timerAddToVidAf);
          timerAddToVidAf = 0;
        }
      }, iOS || Android ? 2000 : 1000);
    }
  };
  var globalMuted = true;
  var lastItemPlayed = '';
  var lastMuteUnMuteInteraction = 0,
    ignoreChangesDuringMS = 1100;
  var onMutedUnMute = function onMutedUnMute(muted, id) {
    (0, _log.cLog)("Called id " + id + " to " + (muted ? 'mute' : 'unmute'));
    var now = performance.now();
    var recentChange = now - lastMuteUnMuteInteraction < ignoreChangesDuringMS;
    checkInitializedElement(id);
    elements[id].soundInitialized = true;
    if (!recentChange) {
      lastMuteUnMuteInteraction = now;
      globalMuted = muted;
      Object.getOwnPropertyNames(elements).forEach(function (x) {
        if (elements[x].disposed) return;
        var el = getHTMElementByElement(elements[x]);
        if (!el) {
          (0, _log.cLog)("Unknown iframe element with id " + x);
          return;
        }
        if (!elements[x].playerStorage) return;
        if (!elements[x].playerStorage.data.player) return;
        if (iOS && !muted && !elements[x].soundInitialized) return; // iOS requires a user intervention to allow unmuted playback
        elements[x].playerStorage.data.player.muted(muted);
      });
    }
  };
  var onUnMute = function onUnMute(id) {
    return onMutedUnMute(false, id);
  };
  var onMuted = function onMuted(id) {
    return onMutedUnMute(true, id);
  };
  var checkGlobalMute = function checkGlobalMute(items) {
    var avaElement, playingVidCoElementWithSound;
    items.forEach(function (x) {
      var id = x.id;
      if (iOS && !globalMuted && !elements[id].soundInitialized) return; // iOS requires a user intervention to allow unmuted playback
      if (elements[id].disposed) return; // It may be disposed
      try {
        if (!elements[id].playerStorage) checkPlayerStorage(elements[id], id);
        var player = elements[id].playerStorage.data.player;
        if (globalMuted !== player.muted() && (!elements[id].inAVA || globalMuted)) player.muted(globalMuted);
        if (globalMuted && elements[id].playingVidAd) {
          var adsManagerIMA = player.ima.getAdsManager();
          if (adsManagerIMA.getVolume() > 0.001) adsManagerIMA.setVolume(0);
        }
        if (elements[id].inAVA) avaElement = elements[id];else if (!elements[id].paused && !player.muted()) playingVidCoElementWithSound = elements[id];
      } catch (e) {}
    });
    // Try to not have an Ad and a video playing unmuted simultaneously. The VidCo has priority
    if (avaElement && playingVidCoElementWithSound) {
      var el = getHTMElementByElement(avaElement);
      if (el) {
        try {
          var player = avaElement.playerStorage.data.player;
          var adsManagerIMA = player.ima.getAdsManager();
          if (adsManagerIMA.getVolume() > 0.001) {
            (0, _log.cLog)("Muting Ad, as there is a VidCo with sound at the same time", avaElement, playingVidCoElementWithSound);
            adsManagerIMA.setVolume(0);
          }
        } catch (e) {}
      }
    }
  };
  top.removePlayers = function () {
    var items;
    if (useShadowRoot) items = Array.prototype.slice.call(doc.querySelectorAll('.NG_area_image[id^="img-"]')).map(function (x) {
      return x.shadowRoot && x.shadowRoot.querySelector('.vid-iframe-parent div[id^="vid-iframe-img-"]');
    }).filter(function (x) {
      return !!x;
    });else items = Array.prototype.slice.call(doc.querySelectorAll('.NG_area_image[id^="img-"] .vid-iframe-parent iframe[id^="vid-iframe-img-"]')).filter(function (x) {
      return !!x;
    });
    items.forEach(function (x, i) {
      if (i === 0) return; // The first video has some JS code (phase 3), and removing it, causes problems
      var id = x.id;
      if (!id) return;
      if (elements[id].disposed) return;
      if (!elements[id].playerStorage) checkPlayerStorage(elements[id], id);
      if (!elements[id].playerStorage) return;
      if (!elements[id].playerStorage.data) return;
      if (!elements[id].playerStorage.data.player) return;
      var player = elements[id].playerStorage.data.player;
      if (typeof player.dispose !== 'function') return;
      var rect = x.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (typeof player.error === 'function' && !player.error()) {
        if (Math.abs(rect.top) < 4500) return;
        if (Math.abs(rect.bottom) < 4500) return;
      }
      try {
        try {
          if (typeof player.error === 'function' && player.error()) {
            elements[id].errors = elements[id].errors ? elements[id].errors + 1 : 1;
            if (elements[id].errors > 5) elements[id].ignoreByErrors = true;
          }
        } catch (e) {
          console.log("Memory Reducing Error with player", e);
          elements[id].errors = elements[id].errors ? elements[id].errors + 1 : 1;
        }
        elements[id].disposed = true;
        elements[id].soundInitialized = false;
        try {
          elements[id].playerCurrentTime = player.currentTime();
        } catch (e) {
          (0, _log.cLog)("Unable to get currentTime for id ", id);
        }
        if (elements[id].playerStorage.data && elements[id].playerStorage.data.dispose) elements[id].playerStorage.data.dispose();
        var disposePlayer = function (player, rootDocument) {
          top.ampTV.rootDocument = rootDocument;
          player.dispose();
        }.bind(window, player, elements[id].playerStorage.rootDocument);
        if (useShadowRoot) setTimeout(disposePlayer, 1000); // Dispose player later on to allow finishing internal timeouts.
        else disposePlayer(); // Dispose player now as it will be removed from the DOM
        if (elements[id].onDispose && elements[id].onDispose.length) {
          elements[id].onDispose.forEach(function (x) {
            return x();
          });
          elements[id].onDispose.splice(0);
        }
        top.ampTV.deleteConfigById(id);
        delete elements[id].playerStorage;
      } catch (e) {
        (0, _log.cLog)("Memory Reducing Error: ", e, id);
      }
    });
  };
  setInterval(top.removePlayers, 1500);
  var checkDisposedElements = function checkDisposedElements() {
    Object.getOwnPropertyNames(elements).forEach(function (x) {
      var element = elements[x];
      if (!element.disposed) return;
      if (element.ignoreByErrors) return;
      try {
        var anchorElementId = element.vidAfConfig.infiniteDynamicPageConfiguration.anchorElementId;
        var anchorElement = doc.getElementById(anchorElementId);
        var rect = anchorElement.getBoundingClientRect();
        (0, _log.cLog)("Trying to add again item: ", anchorElementId, anchorElement, JSON.stringify(rect), element.reference);
        if (rect.bottom < -1800 || rect.top > 1800) return; // Too far away
        addNewVidAfVideo(element.reference);
      } catch (e) {
        (0, _log.cLog)("Ignoring element ", element, "as I'm unable to find it's anchor Element Id");
      }
    });
  };
  setInterval(checkDisposedElements, 1500);
  var checkPlayerStorage = function checkPlayerStorage(element, id) {
    if (!element) return;
    if (!id) return;
    element.playerStorage = top.ampTV.instances.find(function (x) {
      return x.anchorElement && x.anchorElement.id && (x.anchorElement.id === id || 'vid-iframe-' + x.anchorElement.id === id);
    });
  };
  var playUpperVideo = function playUpperVideo() {
    var items;
    if (useShadowRoot) items = Array.prototype.slice.call(doc.querySelectorAll('.NG_area_image[id^="img-"]')).map(function (x) {
      return x.shadowRoot && x.shadowRoot.querySelector('.vid-iframe-parent div[id^="vid-iframe-img-"]');
    }).filter(function (x) {
      return !!x;
    });else items = Array.prototype.slice.call(doc.querySelectorAll('.NG_area_image[id^="img-"] .vid-iframe-parent iframe[id^="vid-iframe-img-"]')).filter(function (x) {
      return !!x;
    });
    //console.log("Loaded! Check PlayUpperVideo",items)
    checkGlobalMute(items);
    var itemToPlay = [];
    var itemToPause = [];
    var vh = doc.documentElement.clientHeight || 0;
    try {
      vh = Math.max(vh, win.innerHeight || 0);
    } catch (e) {}
    var elementsInAva = 0;
    items.forEach(function (x) {
      checkInitializedElement(x.id);
      var element = elements[x.id];
      if (element.disposed) return; // It may be disposed
      try {
        if (!element.playerStorage) checkPlayerStorage(element, x.id);
        var player = element.playerStorage.data.player;
        element.playingVidAd = player.ads.isInAdMode() && player.ads.isAdPlaying() && !player.paused() && !player.ads.isWaitingForAdBreak();
        element.error = player.error();
      } catch (e) {}
      try {
        element.inAVA = element.playerStorage.data.pollIsAvaOn();
      } catch (e) {
        (0, _log.cLog)("Loaded! inAVA error: " + e);
      }
      var rect = x.getBoundingClientRect();
      element.rect = rect;
      // If in AVA, don't try to pause/play this element
      if (element.playingVidAd) {} else if (typeof element.inAVA !== 'undefined' && element.inAVA) {
        ++elementsInAva;
        element.visibilityWantsToPlay = false;
        element.delayPhase2ForPos = 0;
      } else if (rect.top < -5) {
        itemToPause.push(x);
        element.visibilityWantsToPlay = false;
        element.delayPhase2ForPos = 600;
      } else if (rect.top + rect.height / 2 > vh) {
        itemToPause.push(x);
        element.visibilityWantsToPlay = false;
        element.delayPhase2ForPos = rect.top + rect.height < 2 * vh ? 0 : 400;
      } else if (itemToPlay.length || !element.initialized) {
        itemToPause.push(x);
        element.visibilityWantsToPlay = false;
        element.delayPhase2ForPos = 0;
      } else {
        itemToPlay.push(x);
        element.visibilityWantsToPlay = true;
        element.delayPhase2ForPos = 0;
      }
    });

    // If the video is within the viewport, and there is no video wanting to play, we leave the current visible video playing.
    // This allows the user to click to play it and this system won't mess with that decision.
    if ((!itemToPlay.length || itemToPlay.length === 1 && lastItemPlayed === itemToPlay[0]) && itemToPause.length && itemToPause[0].clientHeight > 0.75 * vh) {
      var itemsPlayingNonWithinViewport = [],
        itemsPlayingAndWithinViewport = [];
      itemToPause.forEach(function (x) {
        var element = elements[x.id];
        if (element.inAVA) return;
        if (!element.playerStorage) checkPlayerStorage(element, x.id);
        if (!element.playerStorage || !element.playerStorage.data.player) return;
        if (!element.playerStorage.data.player.paused()) {
          if (element.rect.bottom > 0 && element.rect.bottom < vh / 3 || element.rect.top < vh && element.rect.top > -vh / 3) itemsPlayingAndWithinViewport.push(x);else itemsPlayingNonWithinViewport.push(x);
        }
      });
      (0, _log.cLog)("itemsPlayingAndWithinViewport", itemsPlayingAndWithinViewport);
      if (itemsPlayingAndWithinViewport.length === 1 && !itemsPlayingNonWithinViewport.length) {
        var index = itemToPause.findIndex(function (x) {
          return x === itemsPlayingAndWithinViewport[0];
        });
        itemToPause.splice(index, 1);
        if (itemToPlay.length) itemToPause.push(itemToPlay[0]);
        itemToPlay.splice(0, 1, itemsPlayingAndWithinViewport[0]);
      }
    }
    //console.log("itemToPause",itemToPause,"itemToPlay",itemToPlay);
    itemToPause.forEach(function (x) {
      var element = elements[x.id];
      element.vastURLForPos = false;
      if (!element.playerStorage) checkPlayerStorage(element, x.id);
      if (!element.playerStorage || !element.playerStorage.data.player) return;
      if (element.playerStorage.data.player.isDisposed_) return;
      if (!element.playerStorage.data.player.paused()) element.playerStorage.data.player.pause();
      element.paused = true;
    });
    itemToPlay.forEach(function (x) {
      var element = elements[x.id];
      element.vastURLForPos = true;
      if (!element.initialized) return;
      if (lastItemPlayed !== x) {
        if (!element.playerStorage) checkPlayerStorage(element, x.id);
        if (!element.playerStorage || !element.playerStorage.data.player) return;
        if (element.playerStorage.data.player.isDisposed_) return;
        lastItemPlayed = x;
        element.playerStorage.data.player.play();
      }
      try {
        if (!element.playerStorage) checkPlayerStorage(element, x.id);
        if (!element.playerStorage || !element.playerStorage.data.player) return;
        if (element.playerStorage.data.player.isDisposed_) return;
        element.paused = element.playerStorage.data.player.paused();
      } catch (e) {}
    });
  };
  playUpperVideo();
  setInterval(playUpperVideo, 300);
  var getNextVideoId = function getNextVideoId(element) {
    if (!element.playerStorage) checkPlayerStorage(element, element.id);
    var el = useShadowRoot ? element.playerStorage.shadowRoot.firstElementChild : element.playerStorage.anchorElement;
    var elRect = el.getBoundingClientRect();
    Object.getOwnPropertyNames(elements).forEach(function (x) {
      var element = elements[x];
      if (element.disposed) return; // It may be disposed
      if (!element.playerStorage) checkPlayerStorage(element, element.id);
      if (!element.playerStorage) return;
      if (!element.playerStorage.shadowRoot) return;
      var byId = getHTMElementByElement(element);
      element.lastRect = byId ? byId.getBoundingClientRect() : null;
    });
    var belowElements = Object.getOwnPropertyNames(elements).filter(function (x) {
      return !elements[x].disposed && !elements[x].inAVA && elements[x].lastRect && elements[x].lastRect.top > elRect.top;
    });
    (0, _log.cLog)("belowElements: ", belowElements.map(function (x) {
      return elements[x];
    }));
    var nearestBelowElement = belowElements.length > 1 ? belowElements.reduce(function (prev, current) {
      return elements[prev].lastRect.top < elements[current].lastRect.top ? prev : current;
    }) : belowElements.pop();
    return nearestBelowElement ? elements[nearestBelowElement] : nearestBelowElement;
  };
  var endedVidCo = function endedVidCo(id) {
    (0, _log.cLog)("Ended vidCo", id);
    //debugger;
    if (typeof elements[id] === 'undefined' || !elements[id]) throw "Unknown id for endedVidCo: " + id;
    var element = elements[id];
    if (!element.playerStorage) checkPlayerStorage(element, id);
    var player = element.playerStorage.data.player;
    if (!player) throw "No player in id for endedVidCo: " + id;
    var next = getNextVideoId(element);
    if (next) {
      var nextIdEl = getHTMElementByElement(next);
      if (nextIdEl) {
        var viewPortHeight = Math.max(doc.documentElement.clientHeight, win.innerHeight || 0);
        if (nextIdEl.clientHeight > viewPortHeight - 30) nextIdEl.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });else {
          var article_area = next.reference.anchorPoint || nextIdEl;
          while (article_area && article_area.id !== 'article_area') article_area = article_area.parentElement;
          if (article_area) {
            var link = article_area.querySelector('.NG_title_post a');
            if (link) link.parentElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });else article_area.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          } else nextIdEl.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
          });
        }
      }
    }
  };
  var lastVASTRequestedTimeStamp = 0;
  var lastVASTRequestedElementId;
  var lastVASTShownTimeStamp = 0;
  var timeBetweenVAST = 45000;
  var timeBetweenVASTRequests = 25000;
  var wantToPlayAVidAd = function wantToPlayAVidAd() {
    var now = performance.now();
    if (lastVASTRequestedTimeStamp > 0 && now - lastVASTRequestedTimeStamp < timeBetweenVASTRequests) return false;
    if (lastVASTShownTimeStamp > 0 && now - lastVASTShownTimeStamp < timeBetweenVAST) return false;
    lastVASTRequestedElementId = undefined;
    var items = Object.getOwnPropertyNames(elements);
    var playingVidAd = items.find(function (x) {
      return elements[x].inAVA || elements[x].playingVidAd;
    });
    (0, _log.cLog)("Items:", items, elements, playingVidAd);
    return !playingVidAd;
  };
  var startedVidAd = function startedVidAd(id) {
    checkInitializedElement(id);
    (0, _log.cLog)('VidAd Play', id);
    lastVASTShownTimeStamp = performance.now();
  };
  var userClosedVidAd = function userClosedVidAd(id) {
    checkInitializedElement(id);
    (0, _log.cLog)('User Closed VidAd', id);
  };
  var getVASTUrl = function getVASTUrl(id) {
    checkInitializedElement(id);
    if (!elements[id].startedVidCo) {
      (0, _log.cLog)("VAST: Ignore3 id " + id);
      return false;
    }
    if (typeof elements[id].vastURLForPos === 'undefined') {
      (0, _log.cLog)("VAST: Ignore id " + id);
      return false;
    }
    if (!elements[id].vastURLForPos) {
      (0, _log.cLog)("VAST: Ignore2 id " + id);
      return false;
    }
    var isTimeForVidAd = lastVASTRequestedElementId === id;
    if (!isTimeForVidAd) {
      (0, _log.cLog)("VAST: Ignore id " + id, isTimeForVidAd, timeBetweenVAST);
      return false;
    }
    (0, _log.cLog)("VAST: Show Ad for id " + id);
    return getVidAdTagURL();
  };
  var delayPhase2 = function delayPhase2(id) {
    if (typeof elements[id].delayPhase2ForPos === 'undefined') return 0;
    return elements[id].delayPhase2ForPos;
  };
  var startVidCo = function startVidCo(id) {
    checkInitializedElement(id);
    (0, _log.cLog)('VidCo Play', id);
    var now = performance.now();
    var element = elements[id];
    if (!element.playerStorage) checkPlayerStorage(element, element.id);
    if (!element.startedVidCo) element.startedVidCo = now;
    if (element.playerCurrentTime) {
      try {
        element.playerStorage.data.player.currentTime(element.playerCurrentTime);
        element.playerCurrentTime = 0;
      } catch (e) {
        console.log("ERROR setting on ", element, " the currentTime to ", element.playerCurrentTime);
      }
    }
    if (wantToPlayAVidAd() && element.vastURLForPos) {
      (0, _log.cLog)('VidCo Play El', element);
      if (!element || !element.playerStorage.data.player || !element.playerStorage.data.player.ima) return;
      element.requestedVidAd = now;
      lastVASTRequestedTimeStamp = now;
      lastVASTRequestedElementId = id;
      if (top.ampliffyTVVideoBlogOpenWrapAccountId && top.ampliffyTVVideoBlogOpenWrapProfileId && element.playerStorage && element.playerStorage.data && _typeof(element.playerStorage.data.vidAdQueue) === 'object') {
        element.playerStorage.data.vidAdQueue.prepareAdTag(false, getVidAdTagURL());
        setTimeout(function () {
          element.playerStorage.data.playerState.adManager.requestAnAd();
          element.playerStorage.data.playerState.adManager.showRequestedAd();
        }, 2000);
      } else {
        element.playerStorage.data.playerState.adManager.requestAnAd();
        element.playerStorage.data.playerState.adManager.showRequestedAd();
      }
    }
  };
  var baseConfig = {
    vidAf: {
      adBreakOnlyPrerolls: true,
      allowPlayListOverride: true,
      autoPlay: false,
      ava: 'bottom-right',
      avaOnlyOnVidAd: true,
      avaCloseDelayOnVidAd: 5,
      avaCloseSize: 20,
      avaForceFloatedOnVidad: false,
      avaForceStartOnLoad: false,
      avaSize: {
        desktop: {
          height: 300,
          width: 534
        },
        mobile: {
          percentage: 21
        }
      },
      avaAvoidCLS: false,
      closeVidCo: false,
      closeVidCoDelayedMS: false,
      closeVidCoIfNoAd: false,
      closeVidCoIfNoAdTimeoutMS: 0,
      closeVidCoOnAdEnd: false,
      closeVidCoOnEnd: false,
      closeVidCoSize: 20,
      comScoreID: 0,
      context: {},
      dev: 0,
      fluid: true,
      logLevel: 3,
      muted: true,
      limitRenditionByPlayerDimensions: true,
      useBandwidthFromLocalStorage: !iOS,
      observers: {},
      playList: {
        items: []
      },
      playListKWs: undefined,
      playListPreloadNum: 0,
      playListUserInterface: "hidden",
      poster: undefined,
      proxy: "https://ads.ampliffy.com/gampad/no.php",
      size: iOS || Android ? [320, 180] : [640, 360],
      styles: 'body {overflow: hidden} ' + '.video-js .vjs-big-play-button, .video-js .title, .video-js .vjs-next-button {display: none !important;} ' + '.video-js { max-height:100vh; max-width:100vw }' + '.vid-iframe-amp { position: absolute; top:0; left:0; bottom:0; right:0; border: 0; overflow: hidden }' + '.vid-iframe-parent { position: relative; width: 100%; padding-bottom: 57% }' + '.vid-iframe-parent div, .vid-iframe-parent iframe { max-width:100vw; max-height:100vh; overflow: hidden; }' + '.vjs-playlist-sidebar { display: none }',
      vastURL: "//pubads.g.doubleclick.net/gampad/ads?sz=#WxH#&iu=/43606300/" + top.ampliffyTVVideoBlogAdUnit + "_VidAd_Lis_MC_AUTO&ciu_szs&impl=s&gdfp_req=1&env=vp&output=xml_vast3&unviewed_position_start=1&url=__page-url__&description_url=__item-description__&correlator=__timestamp__&cust_params=keyword%3Dampvidplayerpost__fbfan__,__item-category__%26title%3D__item-title__%26description%3D__item-description__%26file%3D__item-file__",
      volume_percentage: undefined,
      vidAdSpecial: "",
      vidAdNonLinearAdMaxWidth: 1,
      vidAdNonLinearAdMaxHeight: 1,
      vidCoAdUnit: vidCoAdUnit,
      vidCoImpressions: false,
      vidCoTitleHidden: false,
      videoDescription: "AMP---00008002",
      videoDescriptionURL: "https://es.ampliffy.com/2020/04/hamburgo-nueva-york-es-una-ciudad-de.html",
      videoTitle: "",
      viewability: {
        vidCo: 0.6,
        vidAd: 0.99,
        firstVidAdMilliseconds: 100,
        minMillisecondsBetweenVidAds: 60000,
        forceFirstPrerollEvenIfNoViewability: false,
        ignoreViewabilityIfAboveScrollingPosition: false
      },
      vidAdNumberOfRetries: 5,
      vidAdDelayBetweenRetries: 5000,
      ytVideo: undefined
    }
  };
  win.ampAffiliate = win.ampAffiliate || {};
  var oldGetConfig;
  if (typeof win.ampAffiliate.getConfig === 'function') oldGetConfig = win.ampAffiliate.getConfig;
  win.ampAffiliate.getConfig = win.videoBlogGetConfig = function (window, configID) {
    var frameElement = window.frameElement;
    (0, _log.cLog)("Loaded! Window", window, "FrameElement", frameElement, "ConfigID", configID, "Elements", elements);
    var firstId = configID.id || frameElement.id;
    var id = firstId && typeof elements[firstId] === 'undefined' ? 'vid-iframe-' + firstId : firstId;
    var newConfig = JSON.parse(JSON.stringify(baseConfig));
    (0, _log.cLog)("Loaded! ID", id);
    if (typeof elements[id] !== 'undefined' && typeof elements[id].vidAfConfig !== 'undefined') {
      Object.assign(newConfig.vidAf, elements[id].vidAfConfig);
      newConfig.vidAf.delayPhase2 = delayPhase2.bind(null, '' + id);
      newConfig.vidAf.vastURL = getVASTUrl.bind(null, '' + id);
      if (typeof top.ampliffyTVVideoBlogOpenWrapAccountId !== "undefined") newConfig.vidAf.openwrapAccountId = top.ampliffyTVVideoBlogOpenWrapAccountId;
      if (typeof top.ampliffyTVVideoBlogOpenWrapProfileId !== "undefined") newConfig.vidAf.openwrapProfileId = top.ampliffyTVVideoBlogOpenWrapProfileId;
      if (typeof top.ampliffyTVVideoBlogOpenWrapDelayVidAdUntilOwResponse !== "undefined") newConfig.vidAf.openwrapDelayVidAdUntilOwResponse = top.ampliffyTVVideoBlogOpenWrapDelayVidAdUntilOwResponse;
      /*
      newConfig.vidAf.observers.endedVidCo = newConfig.vidAf.observers.endedVidCo || [];
      newConfig.vidAf.observers.endedVidCo.push(endedVidCo.bind(null,''+id));
       */
      newConfig.vidAf.observers.ready = newConfig.vidAf.observers.ready || [];
      newConfig.vidAf.observers.ready.push(setInitializedElement.bind(null, '' + id));
      newConfig.vidAf.observers.startVidCo = newConfig.vidAf.observers.startVidCo || [];
      newConfig.vidAf.observers.startVidCo.push(startVidCo.bind(null, '' + id));
      newConfig.vidAf.observers.playListEnded = newConfig.vidAf.observers.playListEnded || [];
      newConfig.vidAf.observers.playListEnded.push(endedVidCo.bind(null, '' + id));
      newConfig.vidAf.observers.startedVidAd = newConfig.vidAf.observers.startedVidAd || [];
      newConfig.vidAf.observers.startedVidAd.push(startedVidAd.bind(null, '' + id));
      newConfig.vidAf.observers.userClosedVidAd = newConfig.vidAf.observers.userClosedVidAd || [];
      newConfig.vidAf.observers.userClosedVidAd.push(userClosedVidAd.bind(null, '' + id));
      newConfig.vidAf.observers.muted = newConfig.vidAf.observers.muted || [];
      newConfig.vidAf.observers.muted.push(onMuted.bind(null, '' + id));
      newConfig.vidAf.observers.unmute = newConfig.vidAf.observers.unmute || [];
      newConfig.vidAf.observers.unmute.push(onUnMute.bind(null, '' + id));
    } else if (oldGetConfig === 'function') return oldGetConfig(window);
    (0, _log.cLog)("Assigning new VidAf Config for id " + id, newConfig.vidAf, frameElement);
    return newConfig;
  };
  setTimeout(function () {
    if (win.videoBlogGetConfig !== win.ampAffiliate.getConfig) win.ampAffiliate.getConfig = win.videoBlogGetConfig;
  }, 250);

  // IMPORTANT: Define this AFTER win.ampAffiliate.getConfig, to guarantee the Video Posts get the proper config
  var getVidAfConfig = function getVidAfConfig(defaultVidAfConfig) {
    if (typeof win.vidAfVideos === 'undefined') return defaultVidAfConfig;
    var ret = {};
    win.vidAfVideos.forEach(queueVidAfProcessing);
    //console.log("vidAfVideos ", win.vidAfVideos, ret);
    var oldPush = win.vidAfVideos.push.bind(win.vidAfVideos);
    win.vidAfVideos.push = function (x) {
      oldPush(x);
      queueVidAfProcessing(x);
    };
    return ret;
  };
  getVidAfConfig(defaultVidAfConfig1);
  (0, _log.cLog)('vidAfConfig defined');
  var cssElement = doc.createElement('style');
  cssElement.type = 'text/css';
  cssElement.innerHTML = '.vid-iframe-amp { position: absolute; top:0; left:0; bottom:0; right:0; border: 0; overflow: hidden }' + '.vid-iframe-parent { position: relative; width: 100%; padding-bottom: 57% }' + '.vid-iframe-parent div, .vid-iframe-parent iframe { max-width:100vw; max-height:100vh; overflow: hidden }';
  doc.getElementsByTagName('head')[0].appendChild(cssElement);
  window.addEventListener("orientationchange", function (event) {
    doc.querySelectorAll('div[data-post-id] .NG_area_image').forEach(function (x) {
      return x.style.height = "";
    });
  });
  if (0) {
    // Add a video element always playing to avoid "pop" sound when play stops/resumes
    var v = doc.createElement('div');
    v.style.position = "fixed";
    v.style.opacity = 0.0001;
    v.style.pointerEvents = "none";
    v.style.bottom = 0;
    v.style.right = 0;
    v.style.zIndex = -99999999;
    v.innerHTML = "<video tabindex=\"-1\" muted playsinline autoplay controls loop src=\"https://tpc.googlesyndication.com/simgad/5724338468357575405?\" style=\"width: 360px; height: 203px; left: 0px; top: 0px;\"></video>";
    doc.body.insertBefore(v, doc.body.firstElementChild);
  }
  var genericAnchor = doc.querySelector('div.post-body') || doc.body;
}

},{"./browser/device":1,"./browser/shadowDOM":3,"./dom/isMobile":6,"./dom/viewport":7,"./log/log":8,"./sharer":9}]},{},[10]);
