var observable = require("data/observable");
var dependencyObservable = require("ui/core/dependency-observable");
var weakEvents = require("ui/core/weak-event-listener");
var types = require("utils/types");
var trace = require("trace");
var polymerExpressions = require("js-libs/polymer-expressions");
var bindingBuilder = require("../builder/binding-builder");
var viewModule = require("ui/core/view");
var special_properties_1 = require("ui/builder/special-properties");
var _appModule = null;
function appModule() {
    if (!_appModule) {
        _appModule = require("application");
    }
    return _appModule;
}
var bindingContextProperty = new dependencyObservable.Property("bindingContext", "Bindable", new dependencyObservable.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.Inheritable, onBindingContextChanged));
function onBindingContextChanged(data) {
    var bindable = data.object;
    bindable._onBindingContextChanged(data.oldValue, data.newValue);
}
var contextKey = "context";
var paramsRegex = /\[\s*(['"])*(\w*)\1\s*\]/;
var bc = bindingBuilder.bindingConstants;
var Bindable = (function (_super) {
    __extends(Bindable, _super);
    function Bindable() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Bindable.prototype, "bindings", {
        get: function () {
            if (!this._bindings) {
                this._bindings = {};
            }
            return this._bindings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bindable.prototype, "bindingContext", {
        get: function () {
            return this._getValue(Bindable.bindingContextProperty);
        },
        set: function (value) {
            this._setValue(Bindable.bindingContextProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Bindable.prototype.bind = function (options, source) {
        var binding = this.bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
        }
        binding = new Binding(this, options);
        this.bindings[options.targetProperty] = binding;
        var bindingSource = source;
        if (!bindingSource) {
            bindingSource = this.bindingContext;
            binding.sourceIsBindingContext = true;
        }
        if (!types.isNullOrUndefined(bindingSource)) {
            binding.bind(bindingSource);
        }
    };
    Bindable.prototype.unbind = function (property) {
        var binding = this.bindings[property];
        if (binding) {
            binding.unbind();
            delete this.bindings[property];
        }
    };
    Bindable.prototype._updateTwoWayBinding = function (propertyName, value) {
        var binding = this.bindings[propertyName];
        if (binding) {
            binding.updateTwoWay(value);
        }
    };
    Bindable.prototype._setCore = function (data) {
        _super.prototype._setCore.call(this, data);
        this._updateTwoWayBinding(data.propertyName, data.value);
    };
    Bindable.prototype._onPropertyChanged = function (property, oldValue, newValue) {
        trace.write(this + "._onPropertyChanged(" + property.name + ", " + oldValue + ", " + newValue + ")", trace.categories.Binding);
        _super.prototype._onPropertyChanged.call(this, property, oldValue, newValue);
        if (this instanceof viewModule.View) {
            if (property.metadata.inheritable && this._isInheritedChange() === true) {
                return;
            }
        }
        var binding = this.bindings[property.name];
        if (binding && !binding.updating) {
            if (binding.options.twoWay) {
                trace.write((this + "._updateTwoWayBinding(" + property.name + ", " + newValue + ");") + property.name, trace.categories.Binding);
                this._updateTwoWayBinding(property.name, newValue);
            }
            else {
                trace.write(this + ".unbind(" + property.name + ");", trace.categories.Binding);
                this.unbind(property.name);
            }
        }
    };
    Bindable.prototype._onBindingContextChanged = function (oldValue, newValue) {
        var binding;
        for (var p in this.bindings) {
            binding = this.bindings[p];
            if (binding.updating || !binding.sourceIsBindingContext) {
                continue;
            }
            trace.write("Binding " + binding.target.get() + "." + binding.options.targetProperty + " to new context " + newValue, trace.categories.Binding);
            binding.unbind();
            if (!types.isNullOrUndefined(newValue)) {
                binding.bind(newValue);
            }
        }
    };
    Bindable.bindingContextProperty = bindingContextProperty;
    return Bindable;
})(dependencyObservable.DependencyObservable);
exports.Bindable = Bindable;
var Binding = (function () {
    function Binding(target, options) {
        this.updating = false;
        this.propertyChangeListeners = {};
        this.target = new WeakRef(target);
        this.options = options;
    }
    Binding.prototype.loadedHandlerVisualTreeBinding = function (args) {
        var targetInstance = args.object;
        targetInstance.off(viewModule.View.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
        this.unbind();
        if (!types.isNullOrUndefined(targetInstance.bindingContext)) {
            this.bind(targetInstance.bindingContext);
        }
    };
    ;
    Binding.prototype.bind = function (obj) {
        if (types.isNullOrUndefined(obj)) {
            throw new Error("Expected valid object reference as a source in the Binding.bind method.");
        }
        if (typeof (obj) === "number") {
            obj = new Number(obj);
        }
        if (typeof (obj) === "boolean") {
            obj = new Boolean(obj);
        }
        if (typeof (obj) === "string") {
            obj = new String(obj);
        }
        this.source = new WeakRef(obj);
        this.updateTarget(this.getSourcePropertyValue());
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }
        this.addPropertyChangeListeners(this.source, this.getSourceProperties());
    };
    Binding.prototype.getSourceProperties = function () {
        if (!this.sourcePropertiesArray) {
            this.sourcePropertiesArray = Binding.getProperties(this.options.sourceProperty);
        }
        return this.sourcePropertiesArray;
    };
    Binding.getProperties = function (property) {
        var result;
        if (property) {
            var parentsMatches = property.match(bindingBuilder.parentsRegex);
            result = property.replace(bindingBuilder.parentsRegex, "parentsMatch")
                .replace(/\]/g, "")
                .split(/\.|\[/);
            var i;
            var resultLength = result.length;
            var parentsMatchesCounter = 0;
            for (i = 0; i < resultLength; i++) {
                if (result[i] === "parentsMatch") {
                    result[i] = parentsMatches[parentsMatchesCounter];
                    parentsMatchesCounter++;
                }
            }
            return result;
        }
        else {
            return [];
        }
    };
    Binding.prototype.resolveObjectsAndProperties = function (source, propsArray) {
        var result = [];
        var i;
        var propsArrayLength = propsArray.length;
        var currentObject = source;
        var objProp = "";
        var currentObjectChanged = false;
        for (i = 0; i < propsArrayLength; i++) {
            objProp = propsArray[i];
            if (propsArray[i] === bc.bindingValueKey) {
                currentObjectChanged = true;
            }
            if (propsArray[i] === bc.parentValueKey || propsArray[i].indexOf(bc.parentsValueKey) === 0) {
                var parentView = this.getParentView(this.target.get(), propsArray[i]).view;
                if (parentView) {
                    currentObject = parentView.bindingContext;
                }
                else {
                    var targetInstance = this.target.get();
                    targetInstance.off(viewModule.View.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
                    targetInstance.on(viewModule.View.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
                }
                currentObjectChanged = true;
            }
            result.push({ instance: currentObject, property: objProp });
            if (!currentObjectChanged) {
                currentObject = currentObject ? currentObject[propsArray[i]] : null;
            }
            currentObjectChanged = false;
        }
        return result;
    };
    Binding.prototype.addPropertyChangeListeners = function (source, sourceProperty) {
        var objectsAndProperties = this.resolveObjectsAndProperties(source.get(), sourceProperty);
        var objectsAndPropertiesLength = objectsAndProperties.length;
        if (objectsAndPropertiesLength > 0) {
            var i;
            for (i = 0; i < objectsAndPropertiesLength; i++) {
                var prop = objectsAndProperties[i].property;
                var currentObject = objectsAndProperties[i].instance;
                if (currentObject && !this.propertyChangeListeners[prop] && currentObject instanceof observable.Observable) {
                    weakEvents.addWeakEventListener(currentObject, observable.Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
                    this.propertyChangeListeners[prop] = currentObject;
                }
            }
        }
    };
    Binding.prototype.unbind = function () {
        if (!this.source) {
            return;
        }
        var i;
        var propertyChangeListenersKeys = Object.keys(this.propertyChangeListeners);
        for (i = 0; i < propertyChangeListenersKeys.length; i++) {
            weakEvents.removeWeakEventListener(this.propertyChangeListeners[propertyChangeListenersKeys[i]], observable.Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
            delete this.propertyChangeListeners[propertyChangeListenersKeys[i]];
        }
        if (this.source) {
            this.source.clear();
        }
        if (this.sourceOptions) {
            this.sourceOptions.instance.clear();
            this.sourceOptions = undefined;
        }
        if (this.targetOptions) {
            this.targetOptions = undefined;
        }
        this.sourcePropertiesArray = undefined;
    };
    Binding.prototype.prepareExpressionForUpdate = function () {
        var escapeRegex = /[-\/\\^$*+?.()|[\]{}]/g;
        var escapedSourceProperty = this.options.sourceProperty.replace(escapeRegex, '\\$&');
        var expRegex = new RegExp(escapedSourceProperty, 'g');
        var resultExp = this.options.expression.replace(expRegex, bc.newPropertyValueKey);
        return resultExp;
    };
    Binding.prototype.updateTwoWay = function (value) {
        if (this.updating) {
            return;
        }
        if (this.options.twoWay) {
            if (this.options.expression) {
                var changedModel = {};
                changedModel[bc.bindingValueKey] = value;
                changedModel[bc.newPropertyValueKey] = value;
                var sourcePropertyName = "";
                if (this.sourceOptions) {
                    sourcePropertyName = this.sourceOptions.property;
                }
                else if (typeof this.options.sourceProperty === "string" && this.options.sourceProperty.indexOf(".") === -1) {
                    sourcePropertyName = this.options.sourceProperty;
                }
                if (sourcePropertyName !== "") {
                    changedModel[sourcePropertyName] = value;
                }
                var updateExpression = this.prepareExpressionForUpdate();
                this.prepareContextForExpression(changedModel, updateExpression);
                var expressionValue = this._getExpressionValue(updateExpression, true, changedModel);
                if (expressionValue instanceof Error) {
                    trace.write(expressionValue.message, trace.categories.Binding, trace.messageType.error);
                }
                else {
                    this.updateSource(expressionValue);
                }
            }
            else {
                this.updateSource(value);
            }
        }
    };
    Binding.prototype._getExpressionValue = function (expression, isBackConvert, changedModel) {
        try {
            var exp = polymerExpressions.PolymerExpressions.getExpression(expression);
            if (exp) {
                var context = this.source && this.source.get && this.source.get() || global;
                var model = {};
                for (var prop in appModule().resources) {
                    if (appModule().resources.hasOwnProperty(prop) && !context.hasOwnProperty(prop)) {
                        context[prop] = appModule().resources[prop];
                    }
                }
                this.prepareContextForExpression(context, expression);
                model[contextKey] = context;
                return exp.getValue(model, isBackConvert, changedModel);
            }
            return new Error(expression + " is not a valid expression.");
        }
        catch (e) {
            var errorMessage = "Run-time error occured in file: " + e.sourceURL + " at line: " + e.line + " and column: " + e.column;
            return new Error(errorMessage);
        }
    };
    Binding.prototype.onSourcePropertyChanged = function (data) {
        if (this.options.expression) {
            var expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
            if (expressionValue instanceof Error) {
                trace.write(expressionValue.message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                this.updateTarget(expressionValue);
            }
        }
        else {
            var propIndex = this.getSourceProperties().indexOf(data.propertyName);
            if (propIndex > -1) {
                var props = this.getSourceProperties().slice(propIndex + 1);
                var propsLength = props.length;
                if (propsLength > 0) {
                    var value = data.value;
                    var i;
                    for (i = 0; i < propsLength; i++) {
                        value = value[props[i]];
                    }
                    this.updateTarget(value);
                }
                else if (data.propertyName === this.sourceOptions.property) {
                    this.updateTarget(data.value);
                }
            }
        }
        var sourceProps = Binding.getProperties(this.options.sourceProperty);
        var sourcePropsLength = sourceProps.length;
        var changedPropertyIndex = sourceProps.indexOf(data.propertyName);
        if (changedPropertyIndex > -1) {
            var probablyChangedObject = this.propertyChangeListeners[sourceProps[changedPropertyIndex + 1]];
            if (probablyChangedObject &&
                probablyChangedObject !== data.object[sourceProps[changedPropertyIndex]]) {
                for (i = sourcePropsLength - 1; i > changedPropertyIndex; i--) {
                    weakEvents.removeWeakEventListener(this.propertyChangeListeners[sourceProps[i]], observable.Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
                    delete this.propertyChangeListeners[sourceProps[i]];
                }
                var newProps = sourceProps.slice(changedPropertyIndex + 1);
                this.addPropertyChangeListeners(new WeakRef(data.object[sourceProps[changedPropertyIndex]]), newProps);
            }
        }
    };
    Binding.prototype.prepareContextForExpression = function (model, expression) {
        var parentViewAndIndex;
        var parentView;
        if (expression.indexOf(bc.parentValueKey) > -1) {
            parentView = this.getParentView(this.target.get(), bc.parentValueKey).view;
            if (parentView) {
                model[bc.parentValueKey] = parentView.bindingContext;
            }
        }
        var parentsArray = expression.match(bindingBuilder.parentsRegex);
        if (parentsArray) {
            var i;
            for (i = 0; i < parentsArray.length; i++) {
                parentViewAndIndex = this.getParentView(this.target.get(), parentsArray[i]);
                if (parentViewAndIndex.view) {
                    model[bc.parentsValueKey] = model[bc.parentsValueKey] || {};
                    model[bc.parentsValueKey][parentViewAndIndex.index] = parentViewAndIndex.view.bindingContext;
                }
            }
        }
    };
    Binding.prototype.getSourcePropertyValue = function () {
        if (this.options.expression) {
            var changedModel = {};
            changedModel[bc.bindingValueKey] = this.source.get();
            var expressionValue = this._getExpressionValue(this.options.expression, false, changedModel);
            if (expressionValue instanceof Error) {
                trace.write(expressionValue.message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                return expressionValue;
            }
        }
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }
        var value;
        if (this.sourceOptions) {
            var sourceOptionsInstance = this.sourceOptions.instance.get();
            if (this.sourceOptions.property === bc.bindingValueKey) {
                value = sourceOptionsInstance;
            }
            else if (sourceOptionsInstance instanceof observable.Observable) {
                value = sourceOptionsInstance.get(this.sourceOptions.property);
            }
            else if (sourceOptionsInstance && this.sourceOptions.property &&
                this.sourceOptions.property in sourceOptionsInstance) {
                value = sourceOptionsInstance[this.sourceOptions.property];
            }
        }
        return value;
    };
    Binding.prototype.updateTarget = function (value) {
        if (this.updating || (!this.target || !this.target.get())) {
            return;
        }
        if (!this.targetOptions) {
            this.targetOptions = this.resolveOptions(this.target, Binding.getProperties(this.options.targetProperty));
        }
        this.updateOptions(this.targetOptions, value);
    };
    Binding.prototype.updateSource = function (value) {
        if (this.updating || (!this.source || !this.source.get())) {
            return;
        }
        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }
        this.updateOptions(this.sourceOptions, value);
    };
    Binding.prototype.getParentView = function (target, property) {
        if (!target || !(target instanceof viewModule.View)) {
            return { view: null, index: null };
        }
        var result;
        if (property === bc.parentValueKey) {
            result = target.parent;
        }
        if (property.indexOf(bc.parentsValueKey) === 0) {
            result = target.parent;
            var indexParams = paramsRegex.exec(property);
            var index;
            if (indexParams && indexParams.length > 1) {
                index = indexParams[2];
            }
            if (!isNaN(index)) {
                var indexAsInt = parseInt(index);
                while (indexAsInt > 0) {
                    result = result.parent;
                    indexAsInt--;
                }
            }
            else if (types.isString(index)) {
                while (result && result.typeName !== index) {
                    result = result.parent;
                }
            }
        }
        return { view: result, index: index };
    };
    Binding.prototype.resolveOptions = function (obj, properties) {
        var objectsAndProperties = this.resolveObjectsAndProperties(obj.get(), properties);
        if (objectsAndProperties.length > 0) {
            var resolvedObj = objectsAndProperties[objectsAndProperties.length - 1].instance;
            var prop = objectsAndProperties[objectsAndProperties.length - 1].property;
            if (resolvedObj) {
                return {
                    instance: new WeakRef(resolvedObj),
                    property: prop
                };
            }
        }
        return null;
    };
    Binding.prototype.updateOptions = function (options, value) {
        var optionsInstance;
        if (options && options.instance) {
            optionsInstance = options.instance.get();
        }
        if (!optionsInstance) {
            return;
        }
        this.updating = true;
        try {
            if (optionsInstance instanceof Bindable &&
                viewModule.isEventOrGesture(options.property, optionsInstance) &&
                types.isFunction(value)) {
                optionsInstance.off(options.property, null, optionsInstance.bindingContext);
                optionsInstance.on(options.property, value, optionsInstance.bindingContext);
            }
            else {
                var specialSetter = special_properties_1.getSpecialPropertySetter(options.property);
                if (specialSetter) {
                    specialSetter(optionsInstance, value);
                }
                else {
                    if (optionsInstance instanceof observable.Observable) {
                        optionsInstance.set(options.property, value);
                    }
                    else {
                        optionsInstance[options.property] = value;
                    }
                }
            }
        }
        catch (ex) {
            trace.write("Binding error while setting property " + options.property + " of " + optionsInstance + ": " + ex, trace.categories.Binding, trace.messageType.error);
        }
        this.updating = false;
    };
    return Binding;
})();
exports.Binding = Binding;
