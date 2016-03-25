"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var common = require("./pulltorefresh-common");
var style = require("ui/styling/style");
function refreshingPropertyChanged(data) {
    var pullRefresh = data.object;
    if (!pullRefresh.refreshControl) {
        return;
    }
    if (data.newValue) {
        pullRefresh.refreshControl.beginRefreshing();
    }
    else {
        pullRefresh.refreshControl.endRefreshing();
    }
}
common.PullToRefresh.refreshingProperty.metadata.onSetNativeValue = refreshingPropertyChanged;
global.moduleMerge(common, exports);
var PullToRefreshHandler = (function (_super) {
    __extends(PullToRefreshHandler, _super);
    function PullToRefreshHandler() {
        _super.apply(this, arguments);
    }
    PullToRefreshHandler.initWithOnwer = function (owner) {
        var impl = PullToRefreshHandler.new();
        impl._owner = owner;
        return impl;
    };
    PullToRefreshHandler.prototype.handleRefresh = function (refreshControl) {
        var pullToRefresh = this._owner.get();
        pullToRefresh.refreshing = true;
        pullToRefresh._emit(common.PullToRefresh.refreshEvent);
    };
    PullToRefreshHandler.ObjCExposedMethods = {
        "handleRefresh": { returns: interop.types.void, params: [UIRefreshControl] }
    };
    return PullToRefreshHandler;
}(NSObject));
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh() {
        _super.call(this);
        this._refreshControl = new UIRefreshControl();
        this._handler = PullToRefreshHandler.initWithOnwer(new WeakRef(this));
        this._refreshControl.addTargetActionForControlEvents(this._handler, "handleRefresh", UIControlEvents.ValueChanged);
    }
    Object.defineProperty(PullToRefresh.prototype, "refreshControl", {
        get: function () {
            return this._refreshControl;
        },
        enumerable: true,
        configurable: true
    });
    PullToRefresh.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        if (this.content.ios instanceof UIScrollView) {
            this.content.ios.alwaysBounceVertical = true;
            this.content.ios.addSubview(this._refreshControl);
        }
        else {
            throw new Error("Content must inherit from UIScrollView!");
        }
    };
    return PullToRefresh;
}(common.PullToRefresh));
exports.PullToRefresh = PullToRefresh;
var PullToRefreshStyler = (function () {
    function PullToRefreshStyler() {
    }
    PullToRefreshStyler.setBackgroundColor = function (pullToRefresh, value) {
        var native = pullToRefresh.refreshControl;
        native.backgroundColor = value;
    };
    PullToRefreshStyler.resetBackgroundColor = function (pullToRefresh, value) {
        var native = pullToRefresh.refreshControl;
        native.backgroundColor = value;
    };
    PullToRefreshStyler.setColor = function (pullToRefresh, value) {
        var native = pullToRefresh.refreshControl;
        native.tintColor = value;
    };
    PullToRefreshStyler.resetColor = function (pullToRefresh, value) {
        var native = pullToRefresh.refreshControl;
        native.tintColor = value;
    };
    PullToRefreshStyler.registerHandlers = function () {
        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(PullToRefreshStyler.setBackgroundColor, PullToRefreshStyler.resetBackgroundColor), "PullToRefresh");
        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "PullToRefresh");
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(PullToRefreshStyler.setColor, PullToRefreshStyler.resetColor), "PullToRefresh");
    };
    return PullToRefreshStyler;
}());
exports.PullToRefreshStyler = PullToRefreshStyler;
PullToRefreshStyler.registerHandlers();
