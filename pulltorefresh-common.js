"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var contentView = require("ui/content-view");
var dependencyObservable = require("ui/core/dependency-observable");
var view = require("ui/core/view");
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
    PullToRefresh.prototype._addChildFromBuilder = function (name, value) {
        var originalColor = value.style.color || null;
        if (value instanceof view.View) {
            this.content = value;
        }
        value.style.color = originalColor;
    };
    PullToRefresh.refreshEvent = "refresh";
    PullToRefresh.refreshingProperty = new dependencyObservable.Property("refreshing", "PullToRefresh", new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None));
    return PullToRefresh;
}(contentView.ContentView));
exports.PullToRefresh = PullToRefresh;
