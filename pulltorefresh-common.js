var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var contentView = require("ui/content-view");
var dependencyObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh() {
        _super.call(this);
    }
    Object.defineProperty(PullToRefresh.prototype, "isRefreshing", {
        //get radius(): number {
        //    return this._getValue(SwipeRefreshLayout.radiusProperty);
        //}
        //set radius(value: number) {
        //    this._setValue(SwipeRefreshLayout.radiusProperty, value);
        //}
        get: function () {
            return this._getValue(PullToRefresh.isRefreshingProperty);
        },
        enumerable: true,
        configurable: true
    });
    PullToRefresh.onRefresh = "onRefresh";
    PullToRefresh.isRefreshingProperty = new dependencyObservable.Property("isRefreshing", "SwipeRefreshLayout", new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None));
    return PullToRefresh;
})(contentView.ContentView);
exports.PullToRefresh = PullToRefresh;
