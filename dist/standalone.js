"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$configFile = _ref.configFile,
      configFile = _ref$configFile === undefined ? null : _ref$configFile,
      _ref$policy = _ref.policy,
      policy = _ref$policy === undefined ? [{
    allow: "/",
    cleanParam: null,
    crawlDelay: null,
    userAgent: "*"
  }] : _ref$policy,
      _ref$sitemap = _ref.sitemap,
      sitemap = _ref$sitemap === undefined ? null : _ref$sitemap,
      _ref$host = _ref.host,
      host = _ref$host === undefined ? null : _ref$host;

  var options = {
    host,
    policy,
    sitemap
  };

  return Promise.resolve().then(function () {
    var explorer = (0, _cosmiconfig2.default)("robots-txt", {
      rcExtensions: true
    });

    return explorer.load(process.cwd(), configFile).then(function (result) {
      if (result) {
        options = Object.assign({}, options, result.config);
      }

      return Promise.resolve();
    });
  }).then(function () {
    return new Promise(function (resolve) {
      if (options.policy) {
        if (!Array.isArray(options.policy)) {
          throw new Error("Options `policy` must be array");
        }

        options.policy.forEach(function (item) {
          if (!item.userAgent || item.userAgent && item.userAgent.length === 0) {
            throw new Error("Each `police` should have a single string `userAgent` option");
          }

          if (item.crawlDelay && typeof item.crawlDelay !== "number" && !isFinite(item.crawlDelay)) {
            throw new Error("Option `crawlDelay` must be an integer or a float");
          }

          if (item.cleanParam) {
            if (typeof item.cleanParam === "string" && item.cleanParam.length > 500) {
              throw new Error("Option `cleanParam` should be less or equal 500 characters");
            } else if (Array.isArray(item.cleanParam)) {
              item.cleanParam.forEach(function (subItem) {
                if (typeof subItem === "string" && subItem.length > 500) {
                  throw new Error("String in `cleanParam` option should be less or equal 500 characters");
                } else if (typeof subItem !== "string") {
                  throw new Error("String in `cleanParam` option should be a string");
                }
              });
            } else if (typeof item.cleanParam !== "string" && !Array.isArray(item.cleanParam)) {
              throw new Error("Option `cleanParam` should be a string or an array");
            }
          }
        });
      }

      if (options.sitemap) {
        if (typeof options.sitemap === "string" && !(0, _isAbsoluteUrl2.default)(options.sitemap)) {
          throw new Error("Option `sitemap` should be have an absolute URL");
        } else if (Array.isArray(options.sitemap)) {
          options.sitemap.forEach(function (item) {
            if (typeof item === "string" && !(0, _isAbsoluteUrl2.default)(item)) {
              throw new Error("Item in `sitemap` option should be an absolute URL");
            } else if (typeof item !== "string") {
              throw new Error("Item in `sitemap` option should be a string");
            }
          });
        } else if (typeof options.sitemap !== "string" && !Array.isArray(options.sitemap)) {
          throw new Error("Option `sitemap` should be a string or an array");
        }
      }

      if (options.host) {
        if (typeof options.host !== "string") {
          throw new Error("Options `host` must be only one string");
        }

        var address4 = new _ipAddress.Address4(options.host);
        var address6 = new _ipAddress.Address6(options.host);

        if (address4.isValid() || address6.isValid()) {
          throw new Error("Options `host` should be not an IP address");
        }
      }

      var contents = "";

      options.policy.forEach(function (item, index) {
        contents += generatePoliceItem(item, index);
      });

      if (options.sitemap) {
        contents += addLine("Sitemap", options.sitemap);
      }

      if (options.host) {
        var normalizeHost = options.host;

        if (normalizeHost.search(/^http[s]?:\/\//) === -1) {
          normalizeHost = `http://${host}`;
        }

        var parsedURL = _url2.default.parse(normalizeHost, false, true);

        if (!parsedURL.host) {
          throw new Error("Option `host` does not contain correct host");
        }

        var formattedHost = _url2.default.format({
          host: parsedURL.port && parsedURL.port === "80" ? parsedURL.hostname : parsedURL.host,
          port: parsedURL.port && parsedURL.port === "80" ? "" : parsedURL.port,
          protocol: parsedURL.protocol
        });

        formattedHost = formattedHost.replace(/^http:\/\//, "");

        contents += addLine("Host", formattedHost);
      }

      return resolve(contents);
    });
  });
};

var _ipAddress = require("ip-address");

var _cosmiconfig = require("cosmiconfig");

var _cosmiconfig2 = _interopRequireDefault(_cosmiconfig);

var _isAbsoluteUrl = require("is-absolute-url");

var _isAbsoluteUrl2 = _interopRequireDefault(_isAbsoluteUrl);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addLine(name, rule) {
  var contents = "";

  if (rule && Object.prototype.toString.call(rule) === "[object Array]") {
    rule.forEach(function (item) {
      contents += addLine(name, item);
    });
  } else {
    var ruleContent = name === "Allow" || name === "Disallow" ? encodeURI(rule) : rule;

    contents += `${capitaliseFirstLetter(name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase())}: ${ruleContent}\n`;
  }

  return contents;
}

function generatePoliceItem(item, index) {
  var contents = "";

  if (index !== 0) {
    contents += "\n";
  }

  contents += addLine("User-agent", item.userAgent);

  if (item.allow) {
    if (Array.isArray(item.allow)) {
      item.allow.forEach(function (allowed) {
        contents += addLine("Allow", allowed);
      });
    } else {
      contents += addLine("Allow", item.allow);
    }
  }

  if (item.disallow) {
    if (Array.isArray(item.disallow)) {
      item.disallow.forEach(function (disallowed) {
        contents += addLine("Disallow", disallowed);
      });
    } else {
      contents += addLine("Disallow", item.disallow);
    }
  }

  if (item.crawlDelay) {
    contents += addLine("Crawl-delay", item.crawlDelay);
  }

  if (item.cleanParam) {
    contents += addLine("Clean-param", item.cleanParam);
  }

  return contents;
}