var view = require("ui/core/view");
var fs = require("file-system");
var xml = require("xml");
var types = require("utils/types");
var componentBuilder = require("ui/builder/component-builder");
var platform = require("platform");
var page = require("ui/page");
var fileResolverModule = require("file-system/file-name-resolver");
var trace = require("trace");
var debug = require("utils/debug");
function parse(value, context) {
    if (types.isString(value)) {
        var viewToReturn;
        if (context instanceof view.View) {
            context = getExports(context);
        }
        var componentModule = parseInternal(value, context);
        if (componentModule) {
            viewToReturn = componentModule.component;
        }
        return viewToReturn;
    }
    else if (types.isFunction(value)) {
        return value();
    }
}
exports.parse = parse;
function parseInternal(value, context, uri) {
    var start;
    var ui;
    var errorFormat = (debug.debug && uri) ? xml2ui.SourceErrorFormat(uri) : xml2ui.PositionErrorFormat;
    (start = new xml2ui.XmlStringParser(errorFormat))
        .pipe(new xml2ui.PlatformFilter())
        .pipe(new xml2ui.XmlStateParser(ui = new xml2ui.ComponentParser(context, errorFormat)));
    start.parse(value);
    return ui.rootComponentModule;
}
function loadCustomComponent(componentPath, componentName, attributes, context, parentPage) {
    var result;
    componentPath = componentPath.replace("~/", "");
    var fullComponentPathFilePathWithoutExt = componentPath;
    if (!fs.File.exists(componentPath) || componentPath === "." || componentPath === "./") {
        fullComponentPathFilePathWithoutExt = fs.path.join(fs.knownFolders.currentApp().path, componentPath, componentName);
    }
    var xmlFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "xml");
    if (xmlFilePath) {
        var jsFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "js");
        var subExports = context;
        if (jsFilePath) {
            subExports = require(jsFilePath);
        }
        result = loadInternal(xmlFilePath, subExports);
        if (types.isDefined(result) && types.isDefined(result.component) && types.isDefined(attributes)) {
            var attr;
            for (attr in attributes) {
                componentBuilder.setPropertyValue(result.component, subExports, context, attr, attributes[attr]);
            }
        }
    }
    else {
        result = componentBuilder.getComponentModule(componentName, componentPath, attributes, context);
    }
    var cssFilePath = fileResolverModule.resolveFileName(fullComponentPathFilePathWithoutExt, "css");
    if (cssFilePath) {
        if (parentPage) {
            parentPage.addCssFile(cssFilePath);
        }
        else {
            trace.write("CSS file found but no page specified. Please specify page in the options!", trace.categories.Error, trace.messageType.error);
        }
    }
    return result;
}
function load(pathOrOptions, context) {
    var viewToReturn;
    var componentModule;
    if (!context) {
        if (!types.isString(pathOrOptions)) {
            var options = pathOrOptions;
            componentModule = loadCustomComponent(options.path, options.name, undefined, options.exports, options.page);
        }
        else {
            var path = pathOrOptions;
            componentModule = loadInternal(path);
        }
    }
    else {
        var path = pathOrOptions;
        componentModule = loadInternal(path, context);
    }
    if (componentModule) {
        viewToReturn = componentModule.component;
    }
    return viewToReturn;
}
exports.load = load;
function loadInternal(fileName, context) {
    var componentModule;
    if (fs.File.exists(fileName)) {
        var file = fs.File.fromPath(fileName);
        var onError = function (error) {
            throw new Error("Error loading file " + fileName + " :" + error.message);
        };
        var text = file.readTextSync(onError);
        componentModule = parseInternal(text, context, fileName);
    }
    if (componentModule && componentModule.component) {
        componentModule.component.exports = context;
    }
    return componentModule;
}
function getExports(instance) {
    var parent = instance.parent;
    while (parent && parent.exports === undefined) {
        parent = parent.parent;
    }
    return parent ? parent.exports : undefined;
}
var xml2ui;
(function (xml2ui) {
    var XmlProducerBase = (function () {
        function XmlProducerBase() {
        }
        XmlProducerBase.prototype.pipe = function (next) {
            this._next = next;
            return next;
        };
        XmlProducerBase.prototype.next = function (args) {
            this._next.parse(args);
        };
        return XmlProducerBase;
    })();
    xml2ui.XmlProducerBase = XmlProducerBase;
    var XmlStringParser = (function (_super) {
        __extends(XmlStringParser, _super);
        function XmlStringParser(error) {
            _super.call(this);
            this.error = error || PositionErrorFormat;
        }
        XmlStringParser.prototype.parse = function (value) {
            var _this = this;
            var xmlParser = new xml.XmlParser(function (args) {
                try {
                    _this.next(args);
                }
                catch (e) {
                    throw _this.error(e, args.position);
                }
            }, function (e, p) {
                throw _this.error(e, p);
            }, true);
            if (types.isString(value)) {
                value = value.replace(/xmlns=("|')http:\/\/((www)|(schemas))\.nativescript\.org\/tns\.xsd\1/, "");
                xmlParser.parse(value);
            }
        };
        return XmlStringParser;
    })(XmlProducerBase);
    xml2ui.XmlStringParser = XmlStringParser;
    function PositionErrorFormat(e, p) {
        return new debug.ScopeError(e, "Parsing XML at " + p.line + ":" + p.column);
    }
    xml2ui.PositionErrorFormat = PositionErrorFormat;
    function SourceErrorFormat(uri) {
        return function (e, p) {
            var source = new debug.Source(uri, p.line, p.column);
            e = new debug.SourceError(e, source, "Building UI from XML.");
            return e;
        };
    }
    xml2ui.SourceErrorFormat = SourceErrorFormat;
    var PlatformFilter = (function (_super) {
        __extends(PlatformFilter, _super);
        function PlatformFilter() {
            _super.apply(this, arguments);
        }
        PlatformFilter.prototype.parse = function (args) {
            if (args.eventType === xml.ParserEventType.StartElement) {
                if (PlatformFilter.isPlatform(args.elementName)) {
                    if (this.currentPlatformContext) {
                        throw new Error("Already in '" + this.currentPlatformContext + "' platform context and cannot switch to '" + args.elementName + "' platform! Platform tags cannot be nested.");
                    }
                    this.currentPlatformContext = args.elementName;
                    return;
                }
            }
            if (args.eventType === xml.ParserEventType.EndElement) {
                if (PlatformFilter.isPlatform(args.elementName)) {
                    this.currentPlatformContext = undefined;
                    return;
                }
            }
            if (this.currentPlatformContext && !PlatformFilter.isCurentPlatform(this.currentPlatformContext)) {
                return;
            }
            this.next(args);
        };
        PlatformFilter.isPlatform = function (value) {
            return value && (value.toLowerCase() === platform.platformNames.android.toLowerCase()
                || value.toLowerCase() === platform.platformNames.ios.toLowerCase());
        };
        PlatformFilter.isCurentPlatform = function (value) {
            return value && value.toLowerCase() === platform.device.os.toLowerCase();
        };
        return PlatformFilter;
    })(XmlProducerBase);
    xml2ui.PlatformFilter = PlatformFilter;
    var XmlArgsReplay = (function (_super) {
        __extends(XmlArgsReplay, _super);
        function XmlArgsReplay(args, errorFormat) {
            _super.call(this);
            this.args = args;
            this.error = errorFormat;
        }
        XmlArgsReplay.prototype.replay = function () {
            var _this = this;
            this.args.forEach(function (args) {
                try {
                    _this.next(args);
                }
                catch (e) {
                    throw _this.error(e, args.position);
                }
            });
        };
        return XmlArgsReplay;
    })(XmlProducerBase);
    xml2ui.XmlArgsReplay = XmlArgsReplay;
    var XmlStateParser = (function () {
        function XmlStateParser(state) {
            this.state = state;
        }
        XmlStateParser.prototype.parse = function (args) {
            this.state = this.state.parse(args);
        };
        return XmlStateParser;
    })();
    xml2ui.XmlStateParser = XmlStateParser;
    var TemplateParser = (function () {
        function TemplateParser(parent, templateProperty) {
            this.parent = parent;
            this._context = templateProperty.context;
            this._recordedXmlStream = new Array();
            this._templateProperty = templateProperty;
            this._nestingLevel = 0;
            this._state = 0;
        }
        TemplateParser.prototype.parse = function (args) {
            if (args.eventType === xml.ParserEventType.StartElement) {
                this.parseStartElement(args.prefix, args.namespace, args.elementName, args.attributes);
            }
            else if (args.eventType === xml.ParserEventType.EndElement) {
                this.parseEndElement(args.prefix, args.elementName);
            }
            this._recordedXmlStream.push(args);
            return this._state === 2 ? this.parent : this;
        };
        Object.defineProperty(TemplateParser.prototype, "elementName", {
            get: function () {
                return this._templateProperty.elementName;
            },
            enumerable: true,
            configurable: true
        });
        TemplateParser.prototype.parseStartElement = function (prefix, namespace, elementName, attributes) {
            if (this._state === 0) {
                this._state = 1;
            }
            else if (this._state === 2) {
                throw new Error("Template must have exactly one root element but multiple elements were found.");
            }
            this._nestingLevel++;
        };
        TemplateParser.prototype.parseEndElement = function (prefix, elementName) {
            if (this._state === 0) {
                throw new Error("Template must have exactly one root element but none was found.");
            }
            else if (this._state === 2) {
                throw new Error("No more closing elements expected for this template.");
            }
            this._nestingLevel--;
            if (this._nestingLevel === 0) {
                this._state = 2;
                this.build();
            }
        };
        TemplateParser.prototype.build = function () {
            var _this = this;
            if (this._templateProperty.name in this._templateProperty.parent.component) {
                var context = this._context;
                var errorFormat = this._templateProperty.errorFormat;
                var template = function () {
                    var start;
                    var ui;
                    (start = new xml2ui.XmlArgsReplay(_this._recordedXmlStream, errorFormat))
                        .pipe(new XmlStateParser(ui = new ComponentParser(context, errorFormat)));
                    start.replay();
                    return ui.rootComponentModule.component;
                };
                this._templateProperty.parent.component[this._templateProperty.name] = template;
            }
        };
        return TemplateParser;
    })();
    xml2ui.TemplateParser = TemplateParser;
    var ComponentParser = (function () {
        function ComponentParser(context, errorFormat) {
            this.parents = new Array();
            this.complexProperties = new Array();
            this.context = context;
            this.error = errorFormat;
        }
        ComponentParser.prototype.parse = function (args) {
            var parent = this.parents[this.parents.length - 1];
            var complexProperty = this.complexProperties[this.complexProperties.length - 1];
            if (args.eventType === xml.ParserEventType.StartElement) {
                if (ComponentParser.isComplexProperty(args.elementName)) {
                    var name = ComponentParser.getComplexPropertyName(args.elementName);
                    this.complexProperties.push({
                        parent: parent,
                        name: name,
                        items: [],
                    });
                    if (ComponentParser.isKnownTemplate(name, parent.exports)) {
                        return new TemplateParser(this, {
                            context: (parent ? getExports(parent.component) : null) || this.context,
                            parent: parent,
                            name: name,
                            elementName: args.elementName,
                            templateItems: [],
                            errorFormat: this.error
                        });
                    }
                }
                else {
                    var componentModule;
                    if (args.prefix && args.namespace) {
                        componentModule = loadCustomComponent(args.namespace, args.elementName, args.attributes, this.context, this.currentPage);
                    }
                    else {
                        componentModule = componentBuilder.getComponentModule(args.elementName, args.namespace, args.attributes, this.context);
                    }
                    if (componentModule) {
                        if (parent) {
                            if (complexProperty) {
                                ComponentParser.addToComplexProperty(parent, complexProperty, componentModule);
                            }
                            else if (parent.component._addChildFromBuilder) {
                                parent.component._addChildFromBuilder(args.elementName, componentModule.component);
                            }
                        }
                        else if (this.parents.length === 0) {
                            this.rootComponentModule = componentModule;
                            if (this.rootComponentModule && this.rootComponentModule.component instanceof page.Page) {
                                this.currentPage = this.rootComponentModule.component;
                            }
                        }
                        this.parents.push(componentModule);
                    }
                }
            }
            else if (args.eventType === xml.ParserEventType.EndElement) {
                if (ComponentParser.isComplexProperty(args.elementName)) {
                    if (complexProperty) {
                        if (parent && parent.component._addArrayFromBuilder) {
                            parent.component._addArrayFromBuilder(complexProperty.name, complexProperty.items);
                            complexProperty.items = [];
                        }
                    }
                    this.complexProperties.pop();
                }
                else {
                    this.parents.pop();
                }
            }
            return this;
        };
        ComponentParser.isComplexProperty = function (name) {
            return types.isString(name) && name.indexOf(".") !== -1;
        };
        ComponentParser.getComplexPropertyName = function (fullName) {
            var name;
            if (types.isString(fullName)) {
                var names = fullName.split(".");
                name = names[names.length - 1];
            }
            return name;
        };
        ComponentParser.isKnownTemplate = function (name, exports) {
            return ComponentParser.KNOWNTEMPLATES in exports && exports[ComponentParser.KNOWNTEMPLATES] && name in exports[ComponentParser.KNOWNTEMPLATES];
        };
        ComponentParser.addToComplexProperty = function (parent, complexProperty, elementModule) {
            var parentComponent = parent.component;
            if (ComponentParser.isKnownCollection(complexProperty.name, parent.exports)) {
                complexProperty.items.push(elementModule.component);
            }
            else if (parentComponent._addChildFromBuilder) {
                parentComponent._addChildFromBuilder(complexProperty.name, elementModule.component);
            }
            else {
                parentComponent[complexProperty.name] = elementModule.component;
            }
        };
        ComponentParser.isKnownCollection = function (name, context) {
            return ComponentParser.KNOWNCOLLECTIONS in context && context[ComponentParser.KNOWNCOLLECTIONS] && name in context[ComponentParser.KNOWNCOLLECTIONS];
        };
        ComponentParser.KNOWNCOLLECTIONS = "knownCollections";
        ComponentParser.KNOWNTEMPLATES = "knownTemplates";
        return ComponentParser;
    })();
    xml2ui.ComponentParser = ComponentParser;
})(xml2ui || (xml2ui = {}));
