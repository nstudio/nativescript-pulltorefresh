var content_view_1 = require("ui/content-view");
var view = require("ui/core/view");
var frame = require("ui/frame");
var styleModule = require("../styling/style");
var styleScope = require("../styling/style-scope");
var fs = require("file-system");
var frameCommon = require("../frame/frame-common");
var action_bar_1 = require("ui/action-bar");
var dependency_observable_1 = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
var AffectsLayout = global.android ? dependency_observable_1.PropertyMetadataSettings.None : dependency_observable_1.PropertyMetadataSettings.AffectsLayout;
var backgroundSpanUnderStatusBarProperty = new dependency_observable_1.Property("backgroundSpanUnderStatusBar", "Page", new proxy.PropertyMetadata(false, AffectsLayout));
var actionBarHiddenProperty = new dependency_observable_1.Property("actionBarHidden", "Page", new proxy.PropertyMetadata(undefined, AffectsLayout));
function onActionBarHiddenPropertyChanged(data) {
    var page = data.object;
    if (page.isLoaded) {
        page._updateActionBar(data.newValue);
    }
}
actionBarHiddenProperty.metadata.onSetNativeValue = onActionBarHiddenPropertyChanged;
var Page = (function (_super) {
    __extends(Page, _super);
    function Page(options) {
        _super.call(this, options);
        this._styleScope = new styleScope.StyleScope();
        this._cssFiles = {};
        this.actionBar = new action_bar_1.ActionBar();
    }
    Page.prototype.onLoaded = function () {
        this.style._setValue(styleModule.backgroundColorProperty, "white", dependency_observable_1.ValueSource.Inherited);
        this._applyCss();
        if (this.actionBarHidden !== undefined) {
            this._updateActionBar(this.actionBarHidden);
        }
        _super.prototype.onLoaded.call(this);
    };
    Object.defineProperty(Page.prototype, "backgroundSpanUnderStatusBar", {
        get: function () {
            return this._getValue(Page.backgroundSpanUnderStatusBarProperty);
        },
        set: function (value) {
            this._setValue(Page.backgroundSpanUnderStatusBarProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "actionBarHidden", {
        get: function () {
            return this._getValue(Page.actionBarHiddenProperty);
        },
        set: function (value) {
            this._setValue(Page.actionBarHiddenProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype._updateActionBar = function (hidden) {
    };
    Object.defineProperty(Page.prototype, "navigationContext", {
        get: function () {
            return this._navigationContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "css", {
        get: function () {
            if (this._styleScope) {
                return this._styleScope.css;
            }
            return undefined;
        },
        set: function (value) {
            this._styleScope.css = value;
            this._refreshCss();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "actionBar", {
        get: function () {
            return this._actionBar;
        },
        set: function (value) {
            if (!value) {
                throw new Error("ActionBar cannot be null or undefined.");
            }
            if (this._actionBar !== value) {
                if (this._actionBar) {
                    this._actionBar.page = undefined;
                    this._removeView(this._actionBar);
                }
                this._actionBar = value;
                this._actionBar.page = this;
                this._addView(this._actionBar);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "page", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype._refreshCss = function () {
        if (this._cssApplied) {
            this._resetCssValues();
        }
        this._cssApplied = false;
        if (this.isLoaded) {
            this._applyCss();
        }
    };
    Page.prototype.addCss = function (cssString) {
        this._addCssInternal(cssString, undefined);
    };
    Page.prototype._addCssInternal = function (cssString, cssFileName) {
        this._styleScope.addCss(cssString, cssFileName);
        this._refreshCss();
    };
    Page.prototype.addCssFile = function (cssFileName) {
        if (cssFileName.indexOf("~/") === 0) {
            cssFileName = fs.path.join(fs.knownFolders.currentApp().path, cssFileName.replace("~/", ""));
        }
        if (!this._cssFiles[cssFileName]) {
            if (fs.File.exists(cssFileName)) {
                var file = fs.File.fromPath(cssFileName);
                var text = file.readTextSync();
                if (text) {
                    this._addCssInternal(text, cssFileName);
                    this._cssFiles[cssFileName] = true;
                }
            }
        }
    };
    Object.defineProperty(Page.prototype, "frame", {
        get: function () {
            return this.parent;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype.createNavigatedData = function (eventName, isBackNavigation) {
        return {
            eventName: eventName,
            object: this,
            context: this.navigationContext,
            isBackNavigation: isBackNavigation
        };
    };
    Page.prototype.onNavigatingTo = function (context, isBackNavigation) {
        this._navigationContext = context;
        this.notify(this.createNavigatedData(Page.navigatingToEvent, isBackNavigation));
    };
    Page.prototype.onNavigatedTo = function (isBackNavigation) {
        this.notify(this.createNavigatedData(Page.navigatedToEvent, isBackNavigation));
    };
    Page.prototype.onNavigatingFrom = function (isBackNavigation) {
        this.notify(this.createNavigatedData(Page.navigatingFromEvent, isBackNavigation));
    };
    Page.prototype.onNavigatedFrom = function (isBackNavigation) {
        this.notify(this.createNavigatedData(Page.navigatedFromEvent, isBackNavigation));
        this._navigationContext = undefined;
    };
    Page.prototype.showModal = function () {
        if (arguments.length === 0) {
            this._showNativeModalView(frame.topmost().currentPage, undefined, undefined, true);
        }
        else {
            var moduleName = arguments[0];
            var context = arguments[1];
            var closeCallback = arguments[2];
            var fullscreen = arguments[3];
            var page = frameCommon.resolvePageFromEntry({ moduleName: moduleName });
            page._showNativeModalView(this, context, closeCallback, fullscreen);
        }
    };
    Page.prototype.closeModal = function () {
        if (this._closeModalCallback) {
            this._closeModalCallback.apply(undefined, arguments);
        }
    };
    Object.defineProperty(Page.prototype, "modal", {
        get: function () {
            return this._modal;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype._addChildFromBuilder = function (name, value) {
        if (value instanceof action_bar_1.ActionBar) {
            this.actionBar = value;
        }
        else {
            _super.prototype._addChildFromBuilder.call(this, name, value);
        }
    };
    Page.prototype._showNativeModalView = function (parent, context, closeCallback, fullscreen) {
        parent._modal = this;
        var that = this;
        this._closeModalCallback = function () {
            if (that._closeModalCallback) {
                that._closeModalCallback = null;
                that._hideNativeModalView(parent);
                if (typeof closeCallback === "function") {
                    closeCallback.apply(undefined, arguments);
                }
            }
        };
    };
    Page.prototype._hideNativeModalView = function (parent) {
        parent._modal = undefined;
    };
    Page.prototype._raiseShownModallyEvent = function (parent, context, closeCallback) {
        this.notify({
            eventName: Page.shownModallyEvent,
            object: this,
            context: context,
            closeCallback: this._closeModalCallback
        });
    };
    Page.prototype._getStyleScope = function () {
        return this._styleScope;
    };
    Page.prototype._eachChildView = function (callback) {
        _super.prototype._eachChildView.call(this, callback);
        callback(this.actionBar);
    };
    Page.prototype._applyCss = function () {
        if (this._cssApplied) {
            return;
        }
        this._styleScope.ensureSelectors();
        var scope = this._styleScope;
        var checkSelectors = function (view) {
            scope.applySelectors(view);
            return true;
        };
        checkSelectors(this);
        view.eachDescendant(this, checkSelectors);
        this._cssApplied = true;
    };
    Page.prototype._resetCssValues = function () {
        var resetCssValuesFunc = function (view) {
            view.style._resetCssValues();
            return true;
        };
        resetCssValuesFunc(this);
        view.eachDescendant(this, resetCssValuesFunc);
    };
    Page.backgroundSpanUnderStatusBarProperty = backgroundSpanUnderStatusBarProperty;
    Page.actionBarHiddenProperty = actionBarHiddenProperty;
    Page.navigatingToEvent = "navigatingTo";
    Page.navigatedToEvent = "navigatedTo";
    Page.navigatingFromEvent = "navigatingFrom";
    Page.navigatedFromEvent = "navigatedFrom";
    Page.shownModallyEvent = "shownModally";
    return Page;
})(content_view_1.ContentView);
exports.Page = Page;
