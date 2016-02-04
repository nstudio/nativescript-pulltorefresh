var types = require("utils/types");
var style = require("./style");
var stylersCommon = require("./stylers-common");
var enums = require("ui/enums");
var utils = require("utils/utils");
var styleModule = require("./style");
var background = require("ui/styling/background");
var btn;
global.moduleMerge(stylersCommon, exports);
var SDK = android.os.Build.VERSION.SDK_INT;
var ignorePropertyHandler = new stylersCommon.StylePropertyChangedHandler(function (view, val) {
}, function (view, val) {
});
var _defaultBackgrounds = new Map();
function onBackgroundOrBorderPropertyChanged(v) {
    if (!btn) {
        btn = require("ui/button");
    }
    var nativeView = v._nativeView;
    if (!nativeView) {
        return;
    }
    var backgroundValue = v.style._getValue(styleModule.backgroundInternalProperty);
    var borderWidth = v.borderWidth;
    if (v.borderWidth !== 0 || v.borderRadius !== 0 || !backgroundValue.isEmpty()) {
        var bkg = nativeView.getBackground();
        if (!(bkg instanceof background.ad.BorderDrawable)) {
            bkg = new background.ad.BorderDrawable();
            var viewClass = types.getClass(v);
            if (!(v instanceof btn.Button) && !_defaultBackgrounds.has(viewClass)) {
                _defaultBackgrounds.set(viewClass, nativeView.getBackground());
            }
            nativeView.setBackground(bkg);
        }
        bkg.borderWidth = v.borderWidth;
        bkg.cornerRadius = v.borderRadius;
        bkg.borderColor = v.borderColor ? v.borderColor.android : android.graphics.Color.TRANSPARENT;
        bkg.background = backgroundValue;
        if (SDK < 18) {
            nativeView.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
        }
    }
    else {
        if (v instanceof btn.Button) {
            var nativeButton = new android.widget.Button(nativeView.getContext());
            nativeView.setBackground(nativeButton.getBackground());
        }
        else {
            var viewClass = types.getClass(v);
            if (_defaultBackgrounds.has(viewClass)) {
                nativeView.setBackground(_defaultBackgrounds.get(viewClass));
            }
        }
        if (SDK < 18) {
            nativeView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        }
    }
    var density = utils.layout.getDisplayDensity();
    nativeView.setPadding(Math.round((borderWidth + v.style.paddingLeft) * density), Math.round((borderWidth + v.style.paddingTop) * density), Math.round((borderWidth + v.style.paddingRight) * density), Math.round((borderWidth + v.style.paddingBottom) * density));
}
var DefaultStyler = (function () {
    function DefaultStyler() {
    }
    DefaultStyler.setBackgroundBorderProperty = function (view, newValue, defaultValue) {
        onBackgroundOrBorderPropertyChanged(view);
    };
    DefaultStyler.resetBackgroundBorderProperty = function (view, nativeValue) {
        onBackgroundOrBorderPropertyChanged(view);
    };
    DefaultStyler.setVisibilityProperty = function (view, newValue) {
        var androidValue = (newValue === enums.Visibility.visible) ? android.view.View.VISIBLE : android.view.View.GONE;
        view._nativeView.setVisibility(androidValue);
    };
    DefaultStyler.resetVisibilityProperty = function (view, nativeValue) {
        view._nativeView.setVisibility(android.view.View.VISIBLE);
    };
    DefaultStyler.setOpacityProperty = function (view, newValue) {
        view._nativeView.setAlpha(float(newValue));
    };
    DefaultStyler.resetOpacityProperty = function (view, nativeValue) {
        view._nativeView.setAlpha(float(1.0));
    };
    DefaultStyler.setMinWidthProperty = function (view, newValue) {
        view._nativeView.setMinimumWidth(Math.round(newValue * utils.layout.getDisplayDensity()));
    };
    DefaultStyler.resetMinWidthProperty = function (view, nativeValue) {
        view._nativeView.setMinimumWidth(0);
    };
    DefaultStyler.setMinHeightProperty = function (view, newValue) {
        view._nativeView.setMinimumHeight(Math.round(newValue * utils.layout.getDisplayDensity()));
    };
    DefaultStyler.resetMinHeightProperty = function (view, nativeValue) {
        view._nativeView.setMinimumHeight(0);
    };
    DefaultStyler.getNativeLayoutParams = function (nativeView) {
        var lp = nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }
        return lp;
    };
    DefaultStyler.setNativeLayoutParamsProperty = function (view, params) {
        var nativeView = view._nativeView;
        var lp = DefaultStyler.getNativeLayoutParams(nativeView);
        lp.leftMargin = Math.round(params.leftMargin * utils.layout.getDisplayDensity());
        lp.topMargin = Math.round(params.topMargin * utils.layout.getDisplayDensity());
        lp.rightMargin = Math.round(params.rightMargin * utils.layout.getDisplayDensity());
        lp.bottomMargin = Math.round(params.bottomMargin * utils.layout.getDisplayDensity());
        var width = params.width * utils.layout.getDisplayDensity();
        var height = params.height * utils.layout.getDisplayDensity();
        if (width < 0) {
            width = -2;
        }
        if (height < 0) {
            height = -2;
        }
        var gravity = 0;
        switch (params.horizontalAlignment) {
            case enums.HorizontalAlignment.left:
                gravity |= android.view.Gravity.LEFT;
                break;
            case enums.HorizontalAlignment.center:
                gravity |= android.view.Gravity.CENTER_HORIZONTAL;
                break;
            case enums.HorizontalAlignment.right:
                gravity |= android.view.Gravity.RIGHT;
                break;
            case enums.HorizontalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_HORIZONTAL;
                if (width < 0) {
                    width = -1;
                }
                break;
            default:
                throw new Error("Invalid horizontalAlignment value: " + params.horizontalAlignment);
        }
        switch (params.verticalAlignment) {
            case enums.VerticalAlignment.top:
                gravity |= android.view.Gravity.TOP;
                break;
            case enums.VerticalAlignment.center || enums.VerticalAlignment.middle:
                gravity |= android.view.Gravity.CENTER_VERTICAL;
                break;
            case enums.VerticalAlignment.bottom:
                gravity |= android.view.Gravity.BOTTOM;
                break;
            case enums.VerticalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_VERTICAL;
                if (height < 0) {
                    height = -1;
                }
                break;
            default:
                throw new Error("Invalid verticalAlignment value: " + params.verticalAlignment);
        }
        lp.gravity = gravity;
        lp.width = Math.round(width);
        lp.height = Math.round(height);
        nativeView.setLayoutParams(lp);
    };
    DefaultStyler.resetNativeLayoutParamsProperty = function (view, nativeValue) {
        var nativeView = view._nativeView;
        var lp = DefaultStyler.getNativeLayoutParams(nativeView);
        lp.width = -1;
        lp.height = -1;
        lp.leftMargin = 0;
        lp.topMargin = 0;
        lp.rightMargin = 0;
        lp.bottomMargin = 0;
        lp.gravity = android.view.Gravity.FILL_HORIZONTAL | android.view.Gravity.FILL_VERTICAL;
        nativeView.setLayoutParams(lp);
    };
    DefaultStyler.setPaddingProperty = function (view, newValue) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((newValue.left + view.borderWidth) * density);
        var top = Math.round((newValue.top + view.borderWidth) * density);
        var right = Math.round((newValue.right + view.borderWidth) * density);
        var bottom = Math.round((newValue.bottom + view.borderWidth) * density);
        view._nativeView.setPadding(left, top, right, bottom);
    };
    DefaultStyler.resetPaddingProperty = function (view, nativeValue) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((nativeValue.left + view.borderWidth) * density);
        var top = Math.round((nativeValue.top + view.borderWidth) * density);
        var right = Math.round((nativeValue.right + view.borderWidth) * density);
        var bottom = Math.round((nativeValue.bottom + view.borderWidth) * density);
        view._nativeView.setPadding(left, top, right, bottom);
    };
    DefaultStyler.registerHandlers = function () {
        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setVisibilityProperty, DefaultStyler.resetVisibilityProperty));
        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setOpacityProperty, DefaultStyler.resetOpacityProperty));
        style.registerHandler(style.minWidthProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setMinWidthProperty, DefaultStyler.resetMinWidthProperty));
        style.registerHandler(style.minHeightProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setMinHeightProperty, DefaultStyler.resetMinHeightProperty));
        var borderHandler = new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setBackgroundBorderProperty, DefaultStyler.resetBackgroundBorderProperty);
        style.registerHandler(style.backgroundInternalProperty, borderHandler);
        style.registerHandler(style.borderWidthProperty, borderHandler);
        style.registerHandler(style.borderColorProperty, borderHandler);
        style.registerHandler(style.borderRadiusProperty, borderHandler);
        style.registerHandler(style.nativeLayoutParamsProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setNativeLayoutParamsProperty, DefaultStyler.resetNativeLayoutParamsProperty));
        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setPaddingProperty, DefaultStyler.resetPaddingProperty), "TextBase");
        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setPaddingProperty, DefaultStyler.resetPaddingProperty), "Button");
        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(DefaultStyler.setPaddingProperty, DefaultStyler.resetPaddingProperty), "LayoutBase");
    };
    return DefaultStyler;
})();
exports.DefaultStyler = DefaultStyler;
var ImageStyler = (function () {
    function ImageStyler() {
    }
    ImageStyler.setBorderRadiusProperty = function (view, newValue, defaultValue) {
        if (!view._nativeView) {
            return;
        }
        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        view._nativeView.setCornerRadius(val);
        onBackgroundOrBorderPropertyChanged(view);
    };
    ImageStyler.resetBorderRadiusProperty = function (view, nativeValue) {
        if (!view._nativeView) {
            return;
        }
        view._nativeView.setCornerRadius(0);
        onBackgroundOrBorderPropertyChanged(view);
    };
    ImageStyler.setBorderWidthProperty = function (view, newValue, defaultValue) {
        if (!view._nativeView) {
            return;
        }
        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        view._nativeView.setBorderWidth(val);
        onBackgroundOrBorderPropertyChanged(view);
    };
    ImageStyler.resetBorderWidthProperty = function (view, nativeValue) {
        if (!view._nativeView) {
            return;
        }
        view._nativeView.setBorderWidth(0);
        onBackgroundOrBorderPropertyChanged(view);
    };
    ImageStyler.registerHandlers = function () {
        style.registerHandler(style.borderRadiusProperty, new stylersCommon.StylePropertyChangedHandler(ImageStyler.setBorderRadiusProperty, ImageStyler.resetBorderRadiusProperty), "Image");
        style.registerHandler(style.borderWidthProperty, new stylersCommon.StylePropertyChangedHandler(ImageStyler.setBorderWidthProperty, ImageStyler.resetBorderWidthProperty), "Image");
    };
    return ImageStyler;
})();
exports.ImageStyler = ImageStyler;
var TextViewStyler = (function () {
    function TextViewStyler() {
    }
    TextViewStyler.setColorProperty = function (view, newValue) {
        view._nativeView.setTextColor(newValue);
    };
    TextViewStyler.resetColorProperty = function (view, nativeValue) {
        view._nativeView.setTextColor(nativeValue);
    };
    TextViewStyler.getNativeColorValue = function (view) {
        return view._nativeView.getTextColors().getDefaultColor();
    };
    TextViewStyler.setFontInternalProperty = function (view, newValue, nativeValue) {
        var tv = view._nativeView;
        var fontValue = newValue;
        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            tv.setTypeface(typeface);
        }
        else {
            tv.setTypeface(nativeValue.typeface);
        }
        if (fontValue.fontSize) {
            tv.setTextSize(fontValue.fontSize);
        }
        else {
            tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    };
    TextViewStyler.resetFontInternalProperty = function (view, nativeValue) {
        var tv = view._nativeView;
        tv.setTypeface(nativeValue.typeface);
        tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    };
    TextViewStyler.getNativeFontInternalValue = function (view) {
        var tv = view._nativeView;
        return {
            typeface: tv.getTypeface(),
            size: tv.getTextSize()
        };
    };
    TextViewStyler.setTextAlignmentProperty = function (view, newValue) {
        var verticalGravity = view._nativeView.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (newValue) {
            case enums.TextAlignment.left:
                view._nativeView.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case enums.TextAlignment.center:
                view._nativeView.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case enums.TextAlignment.right:
                view._nativeView.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                break;
        }
    };
    TextViewStyler.resetTextAlignmentProperty = function (view, nativeValue) {
        view._nativeView.setGravity(nativeValue);
    };
    TextViewStyler.getNativeTextAlignmentValue = function (view) {
        return view._nativeView.getGravity();
    };
    TextViewStyler.setTextDecorationProperty = function (view, newValue) {
        setTextDecoration(view._nativeView, newValue);
    };
    TextViewStyler.resetTextDecorationProperty = function (view, nativeValue) {
        setTextDecoration(view._nativeView, enums.TextDecoration.none);
    };
    TextViewStyler.setTextTransformProperty = function (view, newValue) {
        setTextTransform(view._nativeView, newValue);
    };
    TextViewStyler.resetTextTransformProperty = function (view, nativeValue) {
        setTextTransform(view._nativeView, enums.TextTransform.none);
    };
    TextViewStyler.setWhiteSpaceProperty = function (view, newValue) {
        setWhiteSpace(view._nativeView, newValue);
    };
    TextViewStyler.resetWhiteSpaceProperty = function (view, nativeValue) {
        setWhiteSpace(view._nativeView, enums.WhiteSpace.normal);
    };
    TextViewStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setColorProperty, TextViewStyler.resetColorProperty, TextViewStyler.getNativeColorValue), "TextBase");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setFontInternalProperty, TextViewStyler.resetFontInternalProperty, TextViewStyler.getNativeFontInternalValue), "TextBase");
        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextAlignmentProperty, TextViewStyler.resetTextAlignmentProperty, TextViewStyler.getNativeTextAlignmentValue), "TextBase");
        style.registerHandler(style.textDecorationProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextDecorationProperty, TextViewStyler.resetTextDecorationProperty), "TextBase");
        style.registerHandler(style.textTransformProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextTransformProperty, TextViewStyler.resetTextTransformProperty), "TextBase");
        style.registerHandler(style.whiteSpaceProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setWhiteSpaceProperty, TextViewStyler.resetWhiteSpaceProperty), "TextBase");
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setColorProperty, TextViewStyler.resetColorProperty, TextViewStyler.getNativeColorValue), "Button");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setFontInternalProperty, TextViewStyler.resetFontInternalProperty, TextViewStyler.getNativeFontInternalValue), "Button");
        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextAlignmentProperty, TextViewStyler.resetTextAlignmentProperty, TextViewStyler.getNativeTextAlignmentValue), "Button");
        style.registerHandler(style.textDecorationProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextDecorationProperty, TextViewStyler.resetTextDecorationProperty), "Button");
        style.registerHandler(style.textTransformProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setTextTransformProperty, TextViewStyler.resetTextTransformProperty), "Button");
        style.registerHandler(style.whiteSpaceProperty, new stylersCommon.StylePropertyChangedHandler(TextViewStyler.setWhiteSpaceProperty, TextViewStyler.resetWhiteSpaceProperty), "Button");
    };
    return TextViewStyler;
})();
exports.TextViewStyler = TextViewStyler;
function setTextDecoration(view, value) {
    var flags = 0;
    var values = (value + "").split(" ");
    if (values.indexOf(enums.TextDecoration.underline) !== -1) {
        flags = flags | android.graphics.Paint.UNDERLINE_TEXT_FLAG;
    }
    if (values.indexOf(enums.TextDecoration.lineThrough) !== -1) {
        flags = flags | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
    }
    if (values.indexOf(enums.TextDecoration.none) === -1) {
        view.setPaintFlags(flags);
    }
    else {
        view.setPaintFlags(0);
    }
}
function setTextTransform(view, value) {
    var str = view.getText() + "";
    var result;
    switch (value) {
        case enums.TextTransform.none:
        default:
            result = view["originalString"] || str;
            if (view["transformationMethod"]) {
                view.setTransformationMethod(view["transformationMethod"]);
            }
            break;
        case enums.TextTransform.uppercase:
            view.setTransformationMethod(null);
            result = str.toUpperCase();
            break;
        case enums.TextTransform.lowercase:
            view.setTransformationMethod(null);
            result = str.toLowerCase();
            break;
        case enums.TextTransform.capitalize:
            view.setTransformationMethod(null);
            result = getCapitalizedString(str);
            break;
    }
    if (!view["originalString"]) {
        view["originalString"] = str;
        view["transformationMethod"] = view.getTransformationMethod();
    }
    view.setText(result);
}
function getCapitalizedString(str) {
    var words = str.split(" ");
    var newWords = [];
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }
    return newWords.join(" ");
}
function setWhiteSpace(view, value) {
    view.setSingleLine(value === enums.WhiteSpace.nowrap);
    view.setEllipsize(value === enums.WhiteSpace.nowrap ? android.text.TextUtils.TruncateAt.END : null);
}
var ActivityIndicatorStyler = (function () {
    function ActivityIndicatorStyler() {
    }
    ActivityIndicatorStyler.setColorProperty = function (view, newValue) {
        var bar = view._nativeView;
        bar.getIndeterminateDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    };
    ActivityIndicatorStyler.resetColorProperty = function (view, nativeValue) {
        var bar = view._nativeView;
        bar.getIndeterminateDrawable().clearColorFilter();
    };
    ActivityIndicatorStyler.setActivityIndicatorVisibilityProperty = function (view, newValue) {
        ActivityIndicatorStyler.setIndicatorVisibility(view.busy, newValue, view._nativeView);
    };
    ActivityIndicatorStyler.resetActivityIndicatorVisibilityProperty = function (view, nativeValue) {
        ActivityIndicatorStyler.setIndicatorVisibility(view.busy, enums.Visibility.visible, view._nativeView);
    };
    ActivityIndicatorStyler.setIndicatorVisibility = function (isBusy, visibility, nativeView) {
        if (visibility === enums.Visibility.collapsed || visibility === enums.Visibility.collapse) {
            nativeView.setVisibility(android.view.View.GONE);
        }
        else {
            nativeView.setVisibility(isBusy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    };
    ActivityIndicatorStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(ActivityIndicatorStyler.setColorProperty, ActivityIndicatorStyler.resetColorProperty), "ActivityIndicator");
        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(ActivityIndicatorStyler.setActivityIndicatorVisibilityProperty, ActivityIndicatorStyler.resetActivityIndicatorVisibilityProperty), "ActivityIndicator");
    };
    return ActivityIndicatorStyler;
})();
exports.ActivityIndicatorStyler = ActivityIndicatorStyler;
var SegmentedBarStyler = (function () {
    function SegmentedBarStyler() {
    }
    SegmentedBarStyler.setColorProperty = function (view, newValue) {
        var tabHost = view._nativeView;
        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = tab.getChildAt(1);
            t.setTextColor(newValue);
        }
    };
    SegmentedBarStyler.resetColorProperty = function (view, nativeValue) {
        var tabHost = view._nativeView;
        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = tab.getChildAt(1);
            t.setTextColor(nativeValue);
        }
    };
    SegmentedBarStyler.getColorProperty = function (view) {
        var tabHost = view._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return textView.getCurrentTextColor();
    };
    SegmentedBarStyler.setFontInternalProperty = function (view, newValue, nativeValue) {
        var tabHost = view._nativeView;
        var fontValue = newValue;
        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = tab.getChildAt(1);
            var typeface = fontValue.getAndroidTypeface();
            if (typeface) {
                t.setTypeface(typeface);
            }
            else {
                t.setTypeface(nativeValue.typeface);
            }
            if (fontValue.fontSize) {
                t.setTextSize(fontValue.fontSize);
            }
            else {
                t.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
            }
        }
    };
    SegmentedBarStyler.resetFontInternalProperty = function (view, nativeValue) {
        var tabHost = view._nativeView;
        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = tab.getChildAt(1);
            t.setTypeface(nativeValue.typeface);
            t.setTextSize(nativeValue.size);
        }
    };
    SegmentedBarStyler.getFontInternalProperty = function (view) {
        var tabHost = view._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
    };
    SegmentedBarStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(SegmentedBarStyler.setColorProperty, SegmentedBarStyler.resetColorProperty, SegmentedBarStyler.getColorProperty), "SegmentedBar");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(SegmentedBarStyler.setFontInternalProperty, SegmentedBarStyler.resetFontInternalProperty, SegmentedBarStyler.getFontInternalProperty), "SegmentedBar");
    };
    return SegmentedBarStyler;
})();
exports.SegmentedBarStyler = SegmentedBarStyler;
var ProgressStyler = (function () {
    function ProgressStyler() {
    }
    ProgressStyler.setColorProperty = function (view, newValue) {
        var bar = view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    };
    ProgressStyler.resetColorProperty = function (view, nativeValue) {
        var bar = view._nativeView;
        bar.getProgressDrawable().clearColorFilter();
    };
    ProgressStyler.setBackgroundAndBorderProperty = function (view, newValue) {
        var bar = view._nativeView;
        var progressDrawable = bar.getProgressDrawable();
        if (progressDrawable.getNumberOfLayers && progressDrawable.getNumberOfLayers() > 0) {
            var backgroundDrawable = progressDrawable.getDrawable(0);
            if (backgroundDrawable) {
                backgroundDrawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
            }
        }
    };
    ProgressStyler.resetBackgroundAndBorderProperty = function (view, nativeValue) {
        var bar = view._nativeView;
    };
    ProgressStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(ProgressStyler.setColorProperty, ProgressStyler.resetColorProperty), "Progress");
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(ProgressStyler.setBackgroundAndBorderProperty, ProgressStyler.resetBackgroundAndBorderProperty), "Progress");
        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Progress");
    };
    return ProgressStyler;
})();
exports.ProgressStyler = ProgressStyler;
var SliderStyler = (function () {
    function SliderStyler() {
    }
    SliderStyler.setColorProperty = function (view, newValue) {
        var bar = view._nativeView;
        bar.getThumb().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    };
    SliderStyler.resetColorProperty = function (view, nativeValue) {
        var bar = view._nativeView;
        bar.getThumb().clearColorFilter();
    };
    SliderStyler.setBackgroundAndBorderProperty = function (view, newValue) {
        var bar = view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    };
    SliderStyler.resetBackgroundAndBorderProperty = function (view, nativeValue) {
        var bar = view._nativeView;
    };
    SliderStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(SliderStyler.setColorProperty, SliderStyler.resetColorProperty), "Slider");
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(SliderStyler.setBackgroundAndBorderProperty, SliderStyler.resetBackgroundAndBorderProperty), "Slider");
        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Slider");
    };
    return SliderStyler;
})();
exports.SliderStyler = SliderStyler;
var SwitchStyler = (function () {
    function SwitchStyler() {
    }
    SwitchStyler.setColorProperty = function (view, newValue) {
        var sw = view._nativeView;
        var drawable = sw.getThumbDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    };
    SwitchStyler.resetColorProperty = function (view, nativeValue) {
        var sw = view._nativeView;
    };
    SwitchStyler.setBackgroundAndBorderProperty = function (view, newValue) {
        var sw = view._nativeView;
        var drawable = sw.getTrackDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    };
    SwitchStyler.resetBackgroundAndBorderProperty = function (view, nativeValue) {
        var sw = view._nativeView;
    };
    SwitchStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(SwitchStyler.setColorProperty, SwitchStyler.resetColorProperty), "Switch");
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(SwitchStyler.setBackgroundAndBorderProperty, SwitchStyler.resetBackgroundAndBorderProperty), "Switch");
        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Switch");
    };
    return SwitchStyler;
})();
exports.SwitchStyler = SwitchStyler;
var SearchBarStyler = (function () {
    function SearchBarStyler() {
    }
    SearchBarStyler.getBackgroundColorProperty = function (view) {
        var bar = view._nativeView;
        return bar.getDrawingCacheBackgroundColor();
    };
    SearchBarStyler.setBackgroundColorProperty = function (view, newValue) {
        var bar = view._nativeView;
        bar.setBackgroundColor(newValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, newValue);
    };
    SearchBarStyler.resetBackgroundColorProperty = function (view, nativeValue) {
        var bar = view._nativeView;
        bar.setBackgroundColor(nativeValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, nativeValue);
    };
    SearchBarStyler.getColorProperty = function (view) {
        var bar = view._nativeView;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        if (textView) {
            return textView.getCurrentTextColor();
        }
        return undefined;
    };
    SearchBarStyler.setColorProperty = function (view, newValue) {
        var bar = view._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, newValue);
    };
    SearchBarStyler.resetColorProperty = function (view, nativeValue) {
        var bar = view._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, nativeValue);
    };
    SearchBarStyler.setFontInternalProperty = function (view, newValue, nativeValue) {
        var bar = view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        var fontValue = newValue;
        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            textView.setTypeface(typeface);
        }
        else {
            textView.setTypeface(nativeValue.typeface);
        }
        if (fontValue.fontSize) {
            textView.setTextSize(fontValue.fontSize);
        }
        else {
            textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    };
    SearchBarStyler.resetFontInternalProperty = function (view, nativeValue) {
        var bar = view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        textView.setTypeface(nativeValue.typeface);
        textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    };
    SearchBarStyler.getNativeFontInternalValue = function (view) {
        var bar = view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
    };
    SearchBarStyler.registerHandlers = function () {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(SearchBarStyler.setBackgroundColorProperty, SearchBarStyler.resetBackgroundColorProperty, SearchBarStyler.getBackgroundColorProperty), "SearchBar");
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(SearchBarStyler.setColorProperty, SearchBarStyler.resetColorProperty, SearchBarStyler.getColorProperty), "SearchBar");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(SearchBarStyler.setFontInternalProperty, SearchBarStyler.resetFontInternalProperty, SearchBarStyler.getNativeFontInternalValue), "SearchBar");
    };
    SearchBarStyler._getSearchViewTextView = function (bar) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return bar.findViewById(id);
    };
    SearchBarStyler._changeSearchViewTextColor = function (bar, color) {
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        if (textView) {
            textView.setTextColor(color);
        }
    };
    SearchBarStyler._changeSearchViewPlateBackgroundColor = function (bar, color) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        var textView = bar.findViewById(id);
        if (textView) {
            textView.setBackgroundColor(color);
        }
    };
    return SearchBarStyler;
})();
exports.SearchBarStyler = SearchBarStyler;
var ActionBarStyler = (function () {
    function ActionBarStyler() {
    }
    ActionBarStyler.setColorProperty = function (view, newValue) {
        var toolbar = view._nativeView;
        toolbar.setTitleTextColor(newValue);
    };
    ActionBarStyler.resetColorProperty = function (view, nativeValue) {
        if (types.isNullOrUndefined(nativeValue)) {
            nativeValue = android.graphics.Color.BLACK;
        }
        view._nativeView.setTitleTextColor(nativeValue);
    };
    ActionBarStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(ActionBarStyler.setColorProperty, ActionBarStyler.resetColorProperty), "ActionBar");
    };
    return ActionBarStyler;
})();
exports.ActionBarStyler = ActionBarStyler;
var TabViewStyler = (function () {
    function TabViewStyler() {
    }
    TabViewStyler.setColorProperty = function (view, newValue) {
        var tab = view;
        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();
            for (var i = 0; i < tab.items.length; i++) {
                tabLayout.getTextViewForItemAt(i).setTextColor(newValue);
            }
        }
    };
    TabViewStyler.resetColorProperty = function (view, nativeValue) {
        if (types.isNullOrUndefined(nativeValue)) {
            return;
        }
        var tab = view;
        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();
            for (var i = 0; i < tab.items.length; i++) {
                tabLayout.getTextViewForItemAt(i).setTextColor(nativeValue);
            }
        }
    };
    TabViewStyler.getColorProperty = function (view) {
        var tab = view;
        var tv = tab._getAndroidTabView().getTextViewForItemAt(0);
        if (tv) {
            return tv.getTextColors().getDefaultColor();
        }
        else {
            return null;
        }
    };
    TabViewStyler.setFontInternalProperty = function (view, newValue, nativeValue) {
        var tab = view;
        var fontValue = newValue;
        var typeface = fontValue.getAndroidTypeface();
        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();
            for (var i = 0; i < tab.items.length; i++) {
                var tv = tabLayout.getTextViewForItemAt(i);
                if (typeface) {
                    tv.setTypeface(typeface);
                }
                else {
                    tv.setTypeface(nativeValue.typeface);
                }
                if (fontValue.fontSize) {
                    tv.setTextSize(fontValue.fontSize);
                }
                else {
                    tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
                }
            }
        }
    };
    TabViewStyler.resetFontInternalProperty = function (view, nativeValue) {
        var tab = view;
        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();
            for (var i = 0; i < tab.items.length; i++) {
                var tv = tabLayout.getTextViewForItemAt(i);
                tv.setTypeface(nativeValue.typeface);
                tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
            }
        }
    };
    TabViewStyler.getNativeFontInternalValue = function (view) {
        var tab = view;
        var tv = tab._getAndroidTabView().getTextViewForItemAt(0);
        if (tv) {
            return {
                typeface: tv.getTypeface(),
                size: tv.getTextSize()
            };
        }
        else {
            return null;
        }
    };
    TabViewStyler.registerHandlers = function () {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(TabViewStyler.setColorProperty, TabViewStyler.resetColorProperty, TabViewStyler.getColorProperty), "TabView");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(TabViewStyler.setFontInternalProperty, TabViewStyler.resetFontInternalProperty, TabViewStyler.getNativeFontInternalValue), "TabView");
    };
    return TabViewStyler;
})();
exports.TabViewStyler = TabViewStyler;
function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    ImageStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    ActivityIndicatorStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
    ActionBarStyler.registerHandlers();
    TabViewStyler.registerHandlers();
    ProgressStyler.registerHandlers();
    SwitchStyler.registerHandlers();
    SliderStyler.registerHandlers();
}
exports._registerDefaultStylers = _registerDefaultStylers;
