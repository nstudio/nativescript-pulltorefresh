var color = require("color");
var enums = require("ui/enums");
function colorConverter(value) {
    return new color.Color(value);
}
exports.colorConverter = colorConverter;
function fontSizeConverter(value) {
    var result = parseFloat(value);
    return result;
}
exports.fontSizeConverter = fontSizeConverter;
function textAlignConverter(value) {
    switch (value) {
        case enums.TextAlignment.left:
        case enums.TextAlignment.center:
        case enums.TextAlignment.right:
            return value;
        default:
            throw new Error("CSS text-align \"" + value + "\" is not supported.");
    }
}
exports.textAlignConverter = textAlignConverter;
function textDecorationConverter(value) {
    var values = (value + "").split(" ");
    if (values.indexOf(enums.TextDecoration.none) !== -1 || values.indexOf(enums.TextDecoration.underline) !== -1 || values.indexOf(enums.TextDecoration.lineThrough) !== -1) {
        return value;
    }
    else {
        throw new Error("CSS text-decoration \"" + value + "\" is not supported.");
    }
}
exports.textDecorationConverter = textDecorationConverter;
function whiteSpaceConverter(value) {
    switch (value) {
        case enums.WhiteSpace.normal:
        case enums.WhiteSpace.nowrap:
            return value;
        default:
            throw new Error("CSS white-space \"" + value + "\" is not supported.");
    }
}
exports.whiteSpaceConverter = whiteSpaceConverter;
function textTransformConverter(value) {
    switch (value) {
        case enums.TextTransform.none:
        case enums.TextTransform.uppercase:
        case enums.TextTransform.lowercase:
        case enums.TextTransform.capitalize:
            return value;
        default:
            throw new Error("CSS text-transform \"" + value + "\" is not supported.");
    }
}
exports.textTransformConverter = textTransformConverter;
exports.numberConverter = parseFloat;
function visibilityConverter(value) {
    if (value.toLowerCase() === enums.Visibility.collapsed) {
        return enums.Visibility.collapsed;
    }
    else if (value.toLowerCase() === enums.Visibility.collapse) {
        return enums.Visibility.collapse;
    }
    return enums.Visibility.visible;
}
exports.visibilityConverter = visibilityConverter;
function opacityConverter(value) {
    var result = parseFloat(value);
    result = Math.max(0.0, result);
    result = Math.min(1.0, result);
    return result;
}
exports.opacityConverter = opacityConverter;
