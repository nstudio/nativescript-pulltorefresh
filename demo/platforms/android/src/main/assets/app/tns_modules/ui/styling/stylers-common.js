var types = require("utils/types");
var _appModule = null;
function appModule() {
    if (!_appModule) {
        _appModule = require("application");
    }
    return _appModule;
}
var _defaultNativeValuesCache = {};
var StylePropertyChangedHandler = (function () {
    function StylePropertyChangedHandler(applyCallback, resetCallback, getNativeValue) {
        this._applyProperty = applyCallback;
        this._resetProperty = resetCallback;
        this._getNativeValue = getNativeValue;
    }
    StylePropertyChangedHandler.prototype.applyProperty = function (property, view, newValue) {
        var className = types.getClass(view);
        if (!_defaultNativeValuesCache.hasOwnProperty(className + property.id) && this._getNativeValue) {
            _defaultNativeValuesCache[className + property.id] = this._getNativeValue(view);
        }
        if (appModule().android) {
            newValue = newValue.android ? newValue.android : newValue;
        }
        else if (appModule().ios) {
            newValue = newValue.ios ? newValue.ios : newValue;
        }
        this._applyProperty(view, newValue, _defaultNativeValuesCache[className + property.id]);
    };
    StylePropertyChangedHandler.prototype.resetProperty = function (property, view) {
        var className = types.getClass(view);
        this._resetProperty(view, _defaultNativeValuesCache[className + property.id]);
    };
    return StylePropertyChangedHandler;
})();
exports.StylePropertyChangedHandler = StylePropertyChangedHandler;
