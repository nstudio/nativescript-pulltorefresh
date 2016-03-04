var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var contentView = require("ui/content-view");
var dependencyObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh(options) {
        _super.call(this, options);
    }
    Object.defineProperty(PullToRefresh.prototype, "refreshing", {
        get: function () {
            return this._getValue(PullToRefresh.refreshingProperty);
        },
        set: function (value) {
            this._setValue(PullToRefresh.refreshingProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    PullToRefresh.refreshEvent = "refresh";
    PullToRefresh.refreshingProperty = new dependencyObservable.Property("refreshing", "PullToRefresh", new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None));
    return PullToRefresh;
})(contentView.ContentView);
exports.PullToRefresh = PullToRefresh;
