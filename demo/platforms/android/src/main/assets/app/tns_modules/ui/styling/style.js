var types = require("utils/types");
var trace = require("trace");
var dependency_observable_1 = require("ui/core/dependency-observable");
var color_1 = require("color");
var stylers = require("ui/styling/stylers");
var styleProperty = require("ui/styling/style-property");
var converters = require("./converters");
var enums = require("ui/enums");
var imageSource = require("image-source");
var utils = require("utils/utils");
var font = require("ui/styling/font");
var background = require("ui/styling/background");
var platform = require("platform");
var _registeredHandlers = Array();
var _handlersCache = {};
var noStylingClasses = {};
var AffectsLayout = platform.device.os === platform.platformNames.android ? dependency_observable_1.PropertyMetadataSettings.None : dependency_observable_1.PropertyMetadataSettings.AffectsLayout;
function parseThickness(value) {
    var result = { top: 0, right: 0, bottom: 0, left: 0 };
    if (types.isString(value)) {
        var arr = value.split(/[ ,]+/);
        var top = parseInt(arr[0]);
        top = isNaN(top) ? 0 : top;
        var right = parseInt(arr[1]);
        right = isNaN(right) ? top : right;
        var bottom = parseInt(arr[2]);
        bottom = isNaN(bottom) ? top : bottom;
        var left = parseInt(arr[3]);
        left = isNaN(left) ? right : left;
        result.top = top;
        result.right = right;
        result.bottom = bottom;
        result.left = left;
    }
    else if (types.isNumber(value)) {
        result.top = result.right = result.bottom = result.left = value;
    }
    else {
        result = value;
    }
    return result;
}
function layoutParamsComparer(x, y) {
    return x.width === y.width
        && x.height === y.height
        && x.leftMargin === y.leftMargin
        && x.topMargin === y.topMargin
        && x.rightMargin === y.rightMargin
        && x.bottomMargin === y.bottomMargin
        && x.horizontalAlignment === y.horizontalAlignment
        && x.verticalAlignment === y.verticalAlignment;
}
function onLayoutParamsChanged(data) {
    var style = data.object;
    var layoutParams = {
        width: isNaN(style.width) ? -1 : style.width,
        height: isNaN(style.height) ? -1 : style.height,
        leftMargin: style.marginLeft,
        topMargin: style.marginTop,
        rightMargin: style.marginRight,
        bottomMargin: style.marginBottom,
        horizontalAlignment: style.horizontalAlignment,
        verticalAlignment: style.verticalAlignment
    };
    style._setValue(exports.nativeLayoutParamsProperty, layoutParams);
}
function onPaddingValueChanged(data) {
    var style = data.object;
    var thickness = {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft
    };
    style._setValue(exports.nativePaddingsProperty, thickness);
}
function thicknessComparer(x, y) {
    if (x && y) {
        return x.left === y.left && x.top === y.top && x.right === y.right && x.bottom === y.bottom;
    }
    return !x === !y;
}
function isWidthHeightValid(value) {
    return isNaN(value) || (value >= 0.0 && isFinite(value));
}
function isMinWidthHeightValid(value) {
    return !isNaN(value) && value >= 0.0 && isFinite(value);
}
function onBackgroundImagePropertyChanged(data) {
    var style = data.object;
    var url = data.newValue;
    var currentBackground = style._getValue(exports.backgroundInternalProperty);
    var isValid = false;
    if (types.isString(data.newValue)) {
        var pattern = /url\(('|")(.*?)\1\)/;
        var match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }
        if (utils.isDataURI(url)) {
            var base64Data = url.split(",")[1];
            if (types.isDefined(base64Data)) {
                style._setValue(exports.backgroundInternalProperty, currentBackground.withImage(imageSource.fromBase64(base64Data)));
                isValid = true;
            }
        }
        else if (utils.isFileOrResourcePath(url)) {
            style._setValue(exports.backgroundInternalProperty, currentBackground.withImage(imageSource.fromFileOrResource(url)));
            isValid = true;
        }
        else if (url.indexOf("http") !== -1) {
            style["_url"] = url;
            style._setValue(exports.backgroundInternalProperty, currentBackground.withImage(undefined));
            imageSource.fromUrl(url).then(function (r) {
                if (style && style["_url"] === url) {
                    style._setValue(exports.backgroundInternalProperty, currentBackground.withImage(r));
                }
            });
            isValid = true;
        }
    }
    if (!isValid) {
        style._setValue(exports.backgroundInternalProperty, currentBackground.withImage(undefined));
    }
}
function onBackgroundColorPropertyChanged(data) {
    var style = data.object;
    var currentBackground = style._getValue(exports.backgroundInternalProperty);
    if (!color_1.Color.equals(currentBackground.color, data.newValue)) {
        style._setValue(exports.backgroundInternalProperty, currentBackground.withColor(data.newValue));
    }
}
function onBackgroundSizePropertyChanged(data) {
    var style = data.object;
    var currentBackground = style._getValue(exports.backgroundInternalProperty);
    if (data.newValue !== currentBackground.size) {
        style._setValue(exports.backgroundInternalProperty, currentBackground.withSize(data.newValue));
    }
}
function onBackgroundRepeatPropertyChanged(data) {
    var style = data.object;
    var currentBackground = style._getValue(exports.backgroundInternalProperty);
    if (data.newValue !== currentBackground.repeat) {
        style._setValue(exports.backgroundInternalProperty, currentBackground.withRepeat(data.newValue));
    }
}
function onBackgroundPositionPropertyChanged(data) {
    var style = data.object;
    var currentBackground = style._getValue(exports.backgroundInternalProperty);
    if (data.newValue !== currentBackground.position) {
        style._setValue(exports.backgroundInternalProperty, currentBackground.withPosition(data.newValue));
    }
}
function getHandlerInternal(propertyId, classInfo) {
    var className = classInfo ? classInfo.name : "default";
    var handlerKey = className + propertyId;
    var result = _handlersCache[handlerKey];
    if (types.isDefined(result)) {
        return result;
    }
    var propertyHandlers = _registeredHandlers[propertyId];
    if (noStylingClasses.hasOwnProperty(className) || !propertyHandlers) {
        result = null;
    }
    else if (propertyHandlers.hasOwnProperty(className)) {
        result = propertyHandlers[className];
    }
    else if (classInfo) {
        result = getHandlerInternal(propertyId, classInfo.baseClassInfo);
    }
    else {
        result = null;
    }
    _handlersCache[handlerKey] = result;
    return result;
}
function isVisibilityValid(value) {
    return value === enums.Visibility.visible || value === enums.Visibility.collapse || value === enums.Visibility.collapsed;
}
function isTextDecorationValid(value) {
    var values = (value + "").split(" ");
    return values.indexOf(enums.TextDecoration.none) !== -1 || values.indexOf(enums.TextDecoration.underline) !== -1 || values.indexOf(enums.TextDecoration.lineThrough) !== -1;
}
function isTextTransformValid(value) {
    return value === enums.TextTransform.none || value === enums.TextTransform.uppercase || value === enums.TextTransform.lowercase || value === enums.TextTransform.capitalize;
}
function isWhiteSpaceValid(value) {
    return value === enums.WhiteSpace.nowrap || value === enums.WhiteSpace.normal;
}
function onVisibilityChanged(data) {
    data.object._view._isVisibleCache = data.newValue === enums.Visibility.visible;
}
function isPaddingValid(value) {
    return isFinite(value) && !isNaN(value) && value >= 0;
}
function isMarginValid(value) {
    return isFinite(value) && !isNaN(value);
}
function isOpacityValid(value) {
    var parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && 0 <= parsedValue && parsedValue <= 1;
}
function isFontWeightValid(value) {
    return value === enums.FontWeight.normal || value === enums.FontWeight.bold;
}
function isFontStyleValid(value) {
    return value === enums.FontStyle.normal || value === enums.FontStyle.italic;
}
function onFontFamilyChanged(data) {
    var style = data.object;
    var currentFont = style._getValue(exports.fontInternalProperty);
    if (currentFont.fontFamily !== data.newValue) {
        style._setValue(exports.fontInternalProperty, currentFont.withFontFamily(data.newValue));
    }
}
function onFontStyleChanged(data) {
    var style = data.object;
    var currentFont = style._getValue(exports.fontInternalProperty);
    if (currentFont.fontStyle !== data.newValue) {
        style._setValue(exports.fontInternalProperty, currentFont.withFontStyle(data.newValue));
    }
}
function onFontWeightChanged(data) {
    var style = data.object;
    var currentFont = style._getValue(exports.fontInternalProperty);
    if (currentFont.fontWeight !== data.newValue) {
        style._setValue(exports.fontInternalProperty, currentFont.withFontWeight(data.newValue));
    }
}
function onFontSizeChanged(data) {
    var style = data.object;
    var currentFont = style._getValue(exports.fontInternalProperty);
    if (currentFont.fontSize !== data.newValue) {
        style._setValue(exports.fontInternalProperty, currentFont.withFontSize(data.newValue));
    }
}
var Style = (function (_super) {
    __extends(Style, _super);
    function Style(parentView) {
        _super.call(this);
        this._updateCounter = 0;
        this._nativeSetters = new Map();
        this._view = parentView;
    }
    Object.defineProperty(Style.prototype, "color", {
        get: function () {
            return this._getValue(exports.colorProperty);
        },
        set: function (value) {
            this._setValue(exports.colorProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundColor", {
        get: function () {
            return this._getValue(exports.backgroundColorProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundColorProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundImage", {
        get: function () {
            return this._getValue(exports.backgroundImageProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundImageProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundRepeat", {
        get: function () {
            return this._getValue(exports.backgroundRepeatProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundRepeatProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundSize", {
        get: function () {
            return this._getValue(exports.backgroundSizeProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundSizeProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "backgroundPosition", {
        get: function () {
            return this._getValue(exports.backgroundPositionProperty);
        },
        set: function (value) {
            this._setValue(exports.backgroundPositionProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "borderColor", {
        get: function () {
            return this._getValue(exports.borderColorProperty);
        },
        set: function (value) {
            this._setValue(exports.borderColorProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "borderWidth", {
        get: function () {
            return this._getValue(exports.borderWidthProperty);
        },
        set: function (value) {
            this._setValue(exports.borderWidthProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "borderRadius", {
        get: function () {
            return this._getValue(exports.borderRadiusProperty);
        },
        set: function (value) {
            this._setValue(exports.borderRadiusProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "fontSize", {
        get: function () {
            return this._getValue(exports.fontSizeProperty);
        },
        set: function (value) {
            this._setValue(exports.fontSizeProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "fontFamily", {
        get: function () {
            return this._getValue(exports.fontFamilyProperty);
        },
        set: function (value) {
            this._setValue(exports.fontFamilyProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "fontStyle", {
        get: function () {
            return this._getValue(exports.fontStyleProperty);
        },
        set: function (value) {
            this._setValue(exports.fontStyleProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "fontWeight", {
        get: function () {
            return this._getValue(exports.fontWeightProperty);
        },
        set: function (value) {
            this._setValue(exports.fontWeightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "font", {
        get: function () {
            return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
        },
        set: function (value) {
            this._setShorthandProperty("font", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "_fontInternal", {
        get: function () {
            return this._getValue(exports.fontInternalProperty);
        },
        set: function (value) {
            this._setValue(exports.fontInternalProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "textAlignment", {
        get: function () {
            return this._getValue(exports.textAlignmentProperty);
        },
        set: function (value) {
            this._setValue(exports.textAlignmentProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "minWidth", {
        get: function () {
            return this._getValue(exports.minWidthProperty);
        },
        set: function (value) {
            this._setValue(exports.minWidthProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "minHeight", {
        get: function () {
            return this._getValue(exports.minHeightProperty);
        },
        set: function (value) {
            this._setValue(exports.minHeightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "width", {
        get: function () {
            return this._getValue(exports.widthProperty);
        },
        set: function (value) {
            this._setValue(exports.widthProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "height", {
        get: function () {
            return this._getValue(exports.heightProperty);
        },
        set: function (value) {
            this._setValue(exports.heightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "margin", {
        get: function () {
            return this.marginTop + " " + this.marginRight + " " + this.marginBottom + " " + this.marginLeft;
        },
        set: function (value) {
            this._setShorthandProperty("margin", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "marginLeft", {
        get: function () {
            return this._getValue(exports.marginLeftProperty);
        },
        set: function (value) {
            this._setValue(exports.marginLeftProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "marginTop", {
        get: function () {
            return this._getValue(exports.marginTopProperty);
        },
        set: function (value) {
            this._setValue(exports.marginTopProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "marginRight", {
        get: function () {
            return this._getValue(exports.marginRightProperty);
        },
        set: function (value) {
            this._setValue(exports.marginRightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "marginBottom", {
        get: function () {
            return this._getValue(exports.marginBottomProperty);
        },
        set: function (value) {
            this._setValue(exports.marginBottomProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "padding", {
        get: function () {
            return this.paddingTop + " " + this.paddingRight + " " + this.paddingBottom + " " + this.paddingLeft;
        },
        set: function (value) {
            this._setShorthandProperty("padding", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "paddingLeft", {
        get: function () {
            return this._getValue(exports.paddingLeftProperty);
        },
        set: function (value) {
            this._setValue(exports.paddingLeftProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "paddingTop", {
        get: function () {
            return this._getValue(exports.paddingTopProperty);
        },
        set: function (value) {
            this._setValue(exports.paddingTopProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "paddingRight", {
        get: function () {
            return this._getValue(exports.paddingRightProperty);
        },
        set: function (value) {
            this._setValue(exports.paddingRightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "paddingBottom", {
        get: function () {
            return this._getValue(exports.paddingBottomProperty);
        },
        set: function (value) {
            this._setValue(exports.paddingBottomProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "horizontalAlignment", {
        get: function () {
            return this._getValue(exports.horizontalAlignmentProperty);
        },
        set: function (value) {
            this._setValue(exports.horizontalAlignmentProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "verticalAlignment", {
        get: function () {
            return this._getValue(exports.verticalAlignmentProperty);
        },
        set: function (value) {
            this._setValue(exports.verticalAlignmentProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "visibility", {
        get: function () {
            return this._getValue(exports.visibilityProperty);
        },
        set: function (value) {
            this._setValue(exports.visibilityProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "opacity", {
        get: function () {
            return this._getValue(exports.opacityProperty);
        },
        set: function (value) {
            this._setValue(exports.opacityProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "textDecoration", {
        get: function () {
            return this._getValue(exports.textDecorationProperty);
        },
        set: function (value) {
            this._setValue(exports.textDecorationProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "textTransform", {
        get: function () {
            return this._getValue(exports.textTransformProperty);
        },
        set: function (value) {
            this._setValue(exports.textTransformProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "whiteSpace", {
        get: function () {
            return this._getValue(exports.whiteSpaceProperty);
        },
        set: function (value) {
            this._setValue(exports.whiteSpaceProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Style.prototype._updateTextDecoration = function () {
        if (this._getValue(exports.textDecorationProperty) !== enums.TextDecoration.none) {
            this._applyProperty(exports.textDecorationProperty, this._getValue(exports.textDecorationProperty));
        }
    };
    Style.prototype._updateTextTransform = function () {
        if (this._getValue(exports.textTransformProperty) !== enums.TextTransform.none) {
            this._applyProperty(exports.textTransformProperty, this._getValue(exports.textTransformProperty));
        }
    };
    Style.prototype._beginUpdate = function () {
        this._updateCounter++;
    };
    Style.prototype._endUpdate = function () {
        var _this = this;
        this._updateCounter--;
        if (this._updateCounter < 0) {
            throw new Error("style._endUpdate() called, but no update is in progress.");
        }
        if (this._updateCounter === 0) {
            this._nativeSetters.forEach(function (newValue, property, map) { _this._applyStyleProperty(property, newValue); });
            this._nativeSetters.clear();
        }
    };
    Style.prototype._resetCssValues = function () {
        var that = this;
        this._eachSetProperty(function (property) {
            that._resetValue(property, dependency_observable_1.ValueSource.Css);
            return true;
        });
    };
    Style.prototype._resetLocalValues = function () {
        var that = this;
        this._eachSetProperty(function (property) {
            that._resetValue(property);
            return true;
        });
    };
    Style.prototype._onPropertyChanged = function (property, oldValue, newValue) {
        trace.write("Style._onPropertyChanged view:" + this._view +
            ", property: " + property.name +
            ", oldValue: " + oldValue +
            ", newValue: " + newValue, trace.categories.Style);
        _super.prototype._onPropertyChanged.call(this, property, oldValue, newValue);
        this._view._checkMetadataOnPropertyChanged(property.metadata);
        this._applyProperty(property, newValue);
    };
    Style.prototype._syncNativeProperties = function () {
        var that = this;
        styleProperty.eachProperty(function (p) {
            var value = that._getValue(p);
            var valueSource = that._getValueSource(p);
            if (valueSource !== dependency_observable_1.ValueSource.Default && types.isDefined(value)) {
                that._applyProperty(p, value);
            }
        });
    };
    Style.prototype._sizeChanged = function () {
        if (!this._getValue(exports.backgroundInternalProperty).isEmpty()) {
            this._applyProperty(exports.backgroundInternalProperty, this._getValue(exports.backgroundInternalProperty));
        }
    };
    Style.prototype._applyProperty = function (property, newValue) {
        this._applyStyleProperty(property, newValue);
        if (this._view._childrenCount === 0 || !property.metadata.inheritable) {
            return;
        }
        var eachChild = function (child) {
            child.style._inheritStyleProperty(property);
            return true;
        };
        this._view._eachChildView(eachChild);
    };
    Style.prototype._applyStyleProperty = function (property, newValue) {
        if (!this._view._shouldApplyStyleHandlers()) {
            return;
        }
        if (this._updateCounter > 0) {
            this._nativeSetters.set(property, newValue);
            return;
        }
        try {
            var handler = getHandler(property, this._view);
            if (!handler) {
                trace.write("No handler for property: " + property.name + " with id: " + property.id + ", view:" + this._view, trace.categories.Style);
            }
            else {
                trace.write("Found handler for property: " + property.name + ", view:" + this._view, trace.categories.Style);
                var shouldReset = false;
                if (property.metadata.equalityComparer) {
                    shouldReset = property.metadata.equalityComparer(newValue, property.metadata.defaultValue);
                }
                else {
                    shouldReset = (newValue === property.metadata.defaultValue);
                }
                if (shouldReset) {
                    handler.resetProperty(property, this._view);
                }
                else {
                    handler.applyProperty(property, this._view, newValue);
                }
            }
        }
        catch (ex) {
            trace.write("Error setting property: " + property.name + " on " + this._view + ": " + ex, trace.categories.Style, trace.messageType.error);
        }
    };
    Style.prototype._inheritStyleProperty = function (property) {
        if (!property.metadata.inheritable) {
            throw new Error("An attempt was made to inherit a style property which is not marked as 'inheritable'.");
        }
        var currentParent = this._view.parent;
        var valueSource;
        while (currentParent) {
            valueSource = currentParent.style._getValueSource(property);
            if (valueSource > dependency_observable_1.ValueSource.Default) {
                this._setValue(property, currentParent.style._getValue(property), dependency_observable_1.ValueSource.Inherited);
                break;
            }
            currentParent = currentParent.parent;
        }
    };
    Style.prototype._inheritStyleProperties = function () {
        var that = this;
        styleProperty.eachInheritableProperty(function (p) {
            that._inheritStyleProperty(p);
        });
    };
    Object.defineProperty(Style.prototype, "_nativeView", {
        get: function () {
            return this._view._nativeView;
        },
        enumerable: true,
        configurable: true
    });
    Style.prototype._setShorthandProperty = function (name, value) {
        var pairs = styleProperty.getShorthandPairs(name, value);
        if (pairs) {
            this._beginUpdate();
            for (var j = 0; j < pairs.length; j++) {
                var pair = pairs[j];
                this._setValue(pair.property, pair.value, dependency_observable_1.ValueSource.Local);
            }
            this._endUpdate();
        }
    };
    return Style;
})(dependency_observable_1.DependencyObservable);
exports.Style = Style;
function registerHandler(property, handler, className) {
    var realClassName = className ? className : "default";
    var handlerRecord = _registeredHandlers[property.id];
    if (!handlerRecord) {
        handlerRecord = {};
        _registeredHandlers[property.id] = handlerRecord;
    }
    handlerRecord[realClassName] = handler;
}
exports.registerHandler = registerHandler;
function registerNoStylingClass(className) {
    noStylingClasses[className] = 1;
}
exports.registerNoStylingClass = registerNoStylingClass;
function getHandler(property, view) {
    return getHandlerInternal(property.id, types.getClassInfo(view));
}
exports.getHandler = getHandler;
exports.colorProperty = new styleProperty.Property("color", "color", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.Inheritable, undefined, color_1.Color.isValid, color_1.Color.equals), converters.colorConverter);
exports.backgroundImageProperty = new styleProperty.Property("backgroundImage", "background-image", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, onBackgroundImagePropertyChanged));
exports.backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, onBackgroundColorPropertyChanged, color_1.Color.isValid, color_1.Color.equals), converters.colorConverter);
exports.backgroundRepeatProperty = new styleProperty.Property("backgroundRepeat", "background-repeat", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, onBackgroundRepeatPropertyChanged));
exports.backgroundSizeProperty = new styleProperty.Property("backgroundSize", "background-size", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, onBackgroundSizePropertyChanged));
exports.backgroundPositionProperty = new styleProperty.Property("backgroundPosition", "background-position", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, onBackgroundPositionPropertyChanged));
exports.borderColorProperty = new styleProperty.Property("borderColor", "border-color", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.None, undefined, color_1.Color.isValid, color_1.Color.equals), converters.colorConverter);
exports.borderWidthProperty = new styleProperty.Property("borderWidth", "border-width", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, null, isPaddingValid), converters.numberConverter);
exports.borderRadiusProperty = new styleProperty.Property("borderRadius", "border-radius", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, null, isPaddingValid), converters.numberConverter);
exports.backgroundInternalProperty = new styleProperty.Property("_backgroundInternal", "_backgroundInternal", new dependency_observable_1.PropertyMetadata(background.Background.default, dependency_observable_1.PropertyMetadataSettings.None, undefined, undefined, background.Background.equals));
exports.fontSizeProperty = new styleProperty.Property("fontSize", "font-size", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.Inheritable, onFontSizeChanged), converters.fontSizeConverter);
exports.fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family", new dependency_observable_1.PropertyMetadata(undefined, dependency_observable_1.PropertyMetadataSettings.Inheritable, onFontFamilyChanged));
exports.fontStyleProperty = new styleProperty.Property("fontStyle", "font-style", new dependency_observable_1.PropertyMetadata(enums.FontStyle.normal, dependency_observable_1.PropertyMetadataSettings.Inheritable, onFontStyleChanged, isFontStyleValid));
exports.fontWeightProperty = new styleProperty.Property("fontWeight", "font-weight", new dependency_observable_1.PropertyMetadata(enums.FontWeight.normal, dependency_observable_1.PropertyMetadataSettings.Inheritable, onFontWeightChanged, isFontWeightValid));
exports.fontInternalProperty = new styleProperty.Property("_fontInternal", "_fontInternal", new dependency_observable_1.PropertyMetadata(font.Font.default, AffectsLayout, null, null, font.Font.equals), font.Font.parse);
exports.textAlignmentProperty = new styleProperty.Property("textAlignment", "text-align", new dependency_observable_1.PropertyMetadata(undefined, AffectsLayout | dependency_observable_1.PropertyMetadataSettings.Inheritable), converters.textAlignConverter);
exports.minWidthProperty = new styleProperty.Property("minWidth", "min-width", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), converters.numberConverter);
exports.minHeightProperty = new styleProperty.Property("minHeight", "min-height", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), converters.numberConverter);
exports.visibilityProperty = new styleProperty.Property("visibility", "visibility", new dependency_observable_1.PropertyMetadata(enums.Visibility.visible, AffectsLayout, onVisibilityChanged, isVisibilityValid), converters.visibilityConverter);
exports.opacityProperty = new styleProperty.Property("opacity", "opacity", new dependency_observable_1.PropertyMetadata(1.0, dependency_observable_1.PropertyMetadataSettings.None, undefined, isOpacityValid), converters.opacityConverter);
exports.textDecorationProperty = new styleProperty.Property("textDecoration", "text-decoration", new dependency_observable_1.PropertyMetadata(enums.TextDecoration.none, dependency_observable_1.PropertyMetadataSettings.None, undefined, isTextDecorationValid), converters.textDecorationConverter);
exports.textTransformProperty = new styleProperty.Property("textTransform", "text-transform", new dependency_observable_1.PropertyMetadata(enums.TextTransform.none, dependency_observable_1.PropertyMetadataSettings.None, undefined, isTextTransformValid), converters.textTransformConverter);
exports.whiteSpaceProperty = new styleProperty.Property("whiteSpace", "white-space", new dependency_observable_1.PropertyMetadata(undefined, AffectsLayout, undefined, isWhiteSpaceValid), converters.whiteSpaceConverter);
exports.nativeLayoutParamsProperty = new styleProperty.Property("nativeLayoutParams", "nativeLayoutParams", new dependency_observable_1.PropertyMetadata({
    width: -1,
    height: -1,
    leftMargin: 0,
    topMargin: 0,
    rightMargin: 0,
    bottomMargin: 0,
    horizontalAlignment: enums.HorizontalAlignment.stretch,
    verticalAlignment: enums.VerticalAlignment.stretch
}, null, null, null, layoutParamsComparer));
exports.widthProperty = new styleProperty.Property("width", "width", new dependency_observable_1.PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), converters.numberConverter);
exports.heightProperty = new styleProperty.Property("height", "height", new dependency_observable_1.PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), converters.numberConverter);
exports.verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align", new dependency_observable_1.PropertyMetadata(enums.VerticalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));
exports.horizontalAlignmentProperty = new styleProperty.Property("horizontalAlignment", "horizontal-align", new dependency_observable_1.PropertyMetadata(enums.HorizontalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));
exports.marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);
exports.marginRightProperty = new styleProperty.Property("marginRight", "margin-right", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);
exports.marginTopProperty = new styleProperty.Property("marginTop", "margin-top", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);
exports.marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom", new dependency_observable_1.PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);
function getNativePadding(nativeView, callback) {
    return {
        result: nativeView ? callback(nativeView) / utils.layout.getDisplayDensity() : 0,
        cacheable: !!nativeView
    };
}
function getNativePaddingLeft(instance) {
    var nativeView = instance._nativeView;
    return getNativePadding(nativeView, function (view) { return view.getPaddingLeft(); });
}
function getNativePaddingTop(instance) {
    var nativeView = instance._nativeView;
    return getNativePadding(nativeView, function (view) { return view.getPaddingTop(); });
}
function getNativePaddingRight(instance) {
    var nativeView = instance._nativeView;
    return getNativePadding(nativeView, function (view) { return view.getPaddingRight(); });
}
function getNativePaddingBottom(instance) {
    var nativeView = instance._nativeView;
    return getNativePadding(nativeView, function (view) { return view.getPaddingBottom(); });
}
exports.nativePaddingsProperty = new styleProperty.Property("paddingNative", "paddingNative", new dependency_observable_1.PropertyMetadata(undefined, null, null, null, thicknessComparer));
var defaultPadding = platform.device.os === platform.platformNames.android ? undefined : 0;
exports.paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left", new dependency_observable_1.PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);
exports.paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right", new dependency_observable_1.PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);
exports.paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top", new dependency_observable_1.PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);
exports.paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom", new dependency_observable_1.PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);
if (platform.device.os === platform.platformNames.android) {
    exports.paddingTopProperty.defaultValueGetter = getNativePaddingTop;
    exports.paddingLeftProperty.defaultValueGetter = getNativePaddingLeft;
    exports.paddingRightProperty.defaultValueGetter = getNativePaddingRight;
    exports.paddingBottomProperty.defaultValueGetter = getNativePaddingBottom;
}
function onPaddingChanged(value) {
    var thickness = parseThickness(value);
    var array = new Array();
    array.push({ property: exports.paddingTopProperty, value: thickness.top });
    array.push({ property: exports.paddingRightProperty, value: thickness.right });
    array.push({ property: exports.paddingBottomProperty, value: thickness.bottom });
    array.push({ property: exports.paddingLeftProperty, value: thickness.left });
    return array;
}
function onMarginChanged(value) {
    var thickness = parseThickness(value);
    var array = new Array();
    array.push({ property: exports.marginTopProperty, value: thickness.top });
    array.push({ property: exports.marginRightProperty, value: thickness.right });
    array.push({ property: exports.marginBottomProperty, value: thickness.bottom });
    array.push({ property: exports.marginLeftProperty, value: thickness.left });
    return array;
}
function onFontChanged(value) {
    var newFont = font.Font.parse(value);
    var array = new Array();
    array.push({ property: exports.fontFamilyProperty, value: newFont.fontFamily });
    array.push({ property: exports.fontStyleProperty, value: newFont.fontStyle });
    array.push({ property: exports.fontWeightProperty, value: newFont.fontWeight });
    array.push({ property: exports.fontSizeProperty, value: newFont.fontSize });
    return array;
}
styleProperty.registerShorthandCallback("font", onFontChanged);
styleProperty.registerShorthandCallback("margin", onMarginChanged);
styleProperty.registerShorthandCallback("padding", onPaddingChanged);
stylers._registerDefaultStylers();
