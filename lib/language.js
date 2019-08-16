function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ru', 'zh', 'pt', 'ar', 'ja', 'ko', 'mul'];
/**
 * Language can be set dynamically with `.setLanguage(lang)` method.
 * @param {object} options
 * @param {array} [options.supportedLanguages] - (Supported languages)[https://docs.mapbox.com/help/troubleshooting/change-language/]
 * @param {string} [options.language] - One of the supported languages to apply
 * @param {array} [options.excludedLayerIds=[]] - Array of layer id to exclude from localization
 * @param {function} [options.getLanguageField] - Accepts language and returns language field.
 * By default fields are `name_LANGUAGE` and `name` for multi language (mul).
 */

var Language =
/*#__PURE__*/
function () {
  function Language() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Language);

    this.supportedLanguages = options.supportedLanguages || SUPPORTED_LANGUAGES;
    this.language = options.language;
    this.getLanguageField = options.getLanguageField || getLanguageField;
    this.excludedLayerIds = options.excludedLayerIds || [];
    this.styleChangeListener = this.styleChangeListener.bind(this);
  }

  _createClass(Language, [{
    key: "onAdd",
    value: function onAdd(map) {
      this.map = map;
      this.map.on('styledata', this.styleChangeListener);
      this.container = document.createElement('div');
      return this.container;
    }
  }, {
    key: "onRemove",
    value: function onRemove() {
      this.map.off('styledata', this.styleChangeListener);
      this.map = undefined;
    }
  }, {
    key: "styleChangeListener",
    value: function styleChangeListener() {
      this.map.off('styledata', this.styleChangeListener);
      this.setLanguage(this.language);
    }
  }, {
    key: "setLanguage",
    value: function setLanguage() {
      var _this = this;

      var language = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.browserLanguage();

      if (this.supportedLanguages.indexOf(language) < 0) {
        throw new Error("Language ".concat(language, " is not supported"));
      }

      var style = this.map.getStyle();
      var languageField = this.getLanguageField(language);
      var layers = style.layers.map(function (layer) {
        if (layer.type !== 'symbol') return layer;
        if (!layer.layout || !layer.layout['text-field']) return layer;
        if (_this.excludedLayerIds.indexOf(layer.id) !== -1) return layer;
        var textField = layer.layout['text-field'];
        var textFieldLocalized = localizeTextField(textField, languageField);
        return _objectSpread({}, layer, {
          layout: _objectSpread({}, layer.layout, {
            'text-field': textFieldLocalized
          })
        });
      });
      this.map.setStyle(_objectSpread({}, style, {
        layers: layers
      }));
    }
  }, {
    key: "browserLanguage",
    value: function browserLanguage() {
      var language = navigator.languages ? navigator.languages[0] : navigator.language;
      var parts = language.split('-');
      var languageCode = parts.length > 1 ? parts[0] : language;

      if (this.supportedLanguages.indexOf(languageCode) > -1) {
        return languageCode;
      }

      return null;
    }
  }]);

  return Language;
}();

function getLanguageField(lang) {
  if (lang === 'mul') {
    return 'name';
  }

  return "name_".concat(lang);
}

function localizeTextField(field, lang) {
  if (typeof field === 'string') {
    return field.replace(/{name.*?}/, "{".concat(lang, "}"));
  }

  var str = JSON.stringify(field);

  if (Array.isArray(field)) {
    return JSON.parse(str.replace(/"coalesce",\["get","name.*?"]/g, "\"coalesce\",[\"get\",\"".concat(lang, "\"]")));
  }

  return JSON.parse(str.replace(/{name.*?}/g, "{".concat(lang, "}")));
}

export default Language;