var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var common = require("./pulltorefresh-common");
global.moduleMerge(common, exports);
var PullToRefresh = (function (_super) {
    __extends(PullToRefresh, _super);
    function PullToRefresh() {
        _super.call(this);
    }
    Object.defineProperty(PullToRefresh.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PullToRefresh.prototype, "_nativeView", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    PullToRefresh.prototype._createUI = function () {
        var that = new WeakRef(this);
        console.log('that: ' + that);
        this._android = new android.support.v4.widget.SwipeRefreshLayout(this._context);
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
            console.log('_androidViewId: ' + this._androidViewId);
        }
        this._android.setId(this._androidViewId);
        //if (this.color) {
        //    //var Color = android.graphics.Color;
        //    this._android.setColorSchemeColors(this.color.android, this.color.android, this.color.android, this.color.android);
        //}
        if (this.onRefreshEvent) {
            console.log('this.onRefreshEvent = ' + this.onRefreshEvent);
            this._android.setOnRefreshListener(new android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener({
                get owner() {
                    return that.get();
                },
                onRefresh: function (v) {
                    console.log('onRefresh: (v) = ' + v);
                    //if (this.owner) {
                    console.log('this.owner._emit() = ' + common.PullToRefresh.refreshEvent);
                    this.owner._emit(common.PullToRefresh.refreshEvent);
                    //}
                }
            }));
        }
    };
    return PullToRefresh;
})(common.PullToRefresh);
exports.PullToRefresh = PullToRefresh;
