var view = require("ui/core/view");
var types = require("utils/types");
var fs = require("file-system");
var bindingBuilder = require("./binding-builder");
var platform = require("platform");
var pages = require("ui/page");
var debug = require("utils/debug");
require("ui/layouts/dock-layout");
require("ui/layouts/grid-layout");
require("ui/layouts/absolute-layout");
var special_properties_1 = require("ui/builder/special-properties");
var UI_PATH = "ui/";
var MODULES = {
    "TabViewItem": "ui/tab-view",
    "FormattedString": "text/formatted-string",
    "Span": "text/span",
    "ActionItem": "ui/action-bar",
    "NavigationButton": "ui/action-bar",
    "SegmentedBarItem": "ui/segmented-bar",
};
var CODEFILE = "codeFile";
var CSSFILE = "cssFile";
function getComponentModule(elementName, namespace, attributes, exports) {
    var instance;
    var instanceModule;
    var componentModule;
    elementName = elementName.split("-").map(function (s) { return s[0].toUpperCase() + s.substring(1); }).join("");
    var moduleId = MODULES[elementName] || UI_PATH +
        (elementName.toLowerCase().indexOf("layout") !== -1 ? "layouts/" : "") +
        elementName.split(/(?=[A-Z])/).join("-").toLowerCase();
    try {
        if (types.isString(namespace)) {
            var pathInsideTNSModules = fs.path.join(fs.knownFolders.currentApp().path, "tns_modules", namespace);
            if (fs.Folder.exists(pathInsideTNSModules)) {
                moduleId = pathInsideTNSModules;
            }
            else {
                moduleId = fs.path.join(fs.knownFolders.currentApp().path, namespace);
            }
        }
        instanceModule = require(moduleId);
        var instanceType = instanceModule[elementName] || Object;
        instance = new instanceType();
    }
    catch (ex) {
        throw new debug.ScopeError(ex, "Module '" + moduleId + "' not found for element '" + (namespace ? namespace + ":" : "") + elementName + "'.");
    }
    if (attributes) {
        if (attributes[CODEFILE]) {
            if (instance instanceof pages.Page) {
                var codeFilePath = attributes[CODEFILE].trim();
                if (codeFilePath.indexOf("~/") === 0) {
                    codeFilePath = fs.path.join(fs.knownFolders.currentApp().path, codeFilePath.replace("~/", ""));
                }
                try {
                    exports = require(codeFilePath);
                    instance.exports = exports;
                }
                catch (ex) {
                    throw new Error("Code file with path \"" + codeFilePath + "\" cannot be found!");
                }
            }
            else {
                throw new Error("Code file atribute is valid only for pages!");
            }
        }
        if (attributes[CSSFILE]) {
            if (instance instanceof pages.Page) {
                var cssFilePath = attributes[CSSFILE].trim();
                if (cssFilePath.indexOf("~/") === 0) {
                    cssFilePath = fs.path.join(fs.knownFolders.currentApp().path, cssFilePath.replace("~/", ""));
                }
                if (fs.File.exists(cssFilePath)) {
                    instance.addCssFile(cssFilePath);
                    instance[CSSFILE] = true;
                }
                else {
                    throw new Error("Css file with path \"" + cssFilePath + "\" cannot be found!");
                }
            }
            else {
                throw new Error("Css file atribute is valid only for pages!");
            }
        }
    }
    if (instance && instanceModule) {
        for (var attr in attributes) {
            var attrValue = attributes[attr];
            if (attr.indexOf(":") !== -1) {
                var platformName = attr.split(":")[0].trim();
                if (platformName.toLowerCase() === platform.device.os.toLowerCase()) {
                    attr = attr.split(":")[1].trim();
                }
                else {
                    continue;
                }
            }
            if (attr.indexOf(".") !== -1) {
                var subObj = instance;
                var properties = attr.split(".");
                var subPropName = properties[properties.length - 1];
                var i;
                for (i = 0; i < properties.length - 1; i++) {
                    if (types.isDefined(subObj)) {
                        subObj = subObj[properties[i]];
                    }
                }
                if (types.isDefined(subObj)) {
                    setPropertyValue(subObj, instanceModule, exports, subPropName, attrValue);
                }
            }
            else {
                setPropertyValue(instance, instanceModule, exports, attr, attrValue);
            }
        }
        componentModule = { component: instance, exports: instanceModule };
    }
    return componentModule;
}
exports.getComponentModule = getComponentModule;
function setPropertyValue(instance, instanceModule, exports, propertyName, propertyValue) {
    if (isBinding(propertyValue) && instance.bind) {
        var bindOptions = bindingBuilder.getBindingOptions(propertyName, getBindingExpressionFromAttribute(propertyValue));
        instance.bind({
            sourceProperty: bindOptions[bindingBuilder.bindingConstants.sourceProperty],
            targetProperty: bindOptions[bindingBuilder.bindingConstants.targetProperty],
            expression: bindOptions[bindingBuilder.bindingConstants.expression],
            twoWay: bindOptions[bindingBuilder.bindingConstants.twoWay]
        }, bindOptions[bindingBuilder.bindingConstants.source]);
    }
    else if (view.isEventOrGesture(propertyName, instance)) {
        var handler = exports && exports[propertyValue];
        if (types.isFunction(handler)) {
            instance.on(propertyName, handler);
        }
    }
    else {
        var attrHandled = false;
        var specialSetter = special_properties_1.getSpecialPropertySetter(propertyName);
        if (!attrHandled && specialSetter) {
            specialSetter(instance, propertyValue);
            attrHandled = true;
        }
        if (!attrHandled && instance._applyXmlAttribute) {
            attrHandled = instance._applyXmlAttribute(propertyName, propertyValue);
        }
        if (!attrHandled) {
            if (propertyValue.trim() === "") {
                instance[propertyName] = propertyValue;
            }
            else {
                var valueAsNumber = +propertyValue;
                if (!isNaN(valueAsNumber)) {
                    instance[propertyName] = valueAsNumber;
                }
                else if (propertyValue && (propertyValue.toLowerCase() === "true" || propertyValue.toLowerCase() === "false")) {
                    instance[propertyName] = propertyValue.toLowerCase() === "true" ? true : false;
                }
                else {
                    instance[propertyName] = propertyValue;
                }
            }
        }
    }
}
exports.setPropertyValue = setPropertyValue;
function getBindingExpressionFromAttribute(value) {
    return value.replace("{{", "").replace("}}", "").trim();
}
function isBinding(value) {
    var isBinding;
    if (types.isString(value)) {
        var str = value.trim();
        isBinding = str.indexOf("{{") === 0 && str.lastIndexOf("}}") === str.length - 2;
    }
    return isBinding;
}
