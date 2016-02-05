var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var contentView = require("ui/content-view");
var dependencyObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
var platform = require("platform");
// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh(options) {
        _super.call(this, options);
    }
    Object.defineProperty(PullToRefresh.prototype, "color", {
        get: function () {
            return this._getValue(PullToRefresh.colorProperty);
        },
        set: function (value) {
            this._setValue(PullToRefresh.colorProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PullToRefresh.prototype, "isRefreshing", {
        get: function () {
            return this._getValue(PullToRefresh.isRefreshingProperty);
        },
        enumerable: true,
        configurable: true
    });
    PullToRefresh.prototype.onRefreshEvent = function () { }; //TODO
    PullToRefresh.onRefreshEvent = "onRefresh";
    PullToRefresh.isRefreshingProperty = new dependencyObservable.Property("isRefreshing", "PullToRefresh", new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None));
    PullToRefresh.colorProperty = new dependencyObservable.Property("color", "PullToRefresh", new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None));
    return PullToRefresh;
})(contentView.ContentView);
exports.PullToRefresh = PullToRefresh;
