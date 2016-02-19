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
        this._android = new android.support.v4.widget.SwipeRefreshLayout(this._context);
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);
        //if (this.color) {
        //    //var Color = android.graphics.Color;
        //    this._android.setColorSchemeColors(this.color.android, this.color.android, this.color.android, this.color.android);
        //}
        this._android.setOnRefreshListener(new android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener({
            get owner() {
                return that.get();
            },
            onRefresh: function (v) {
                if (this.owner) {
                    console.log('owner = ' + this.owner);
                    this.owner._emit(common.PullToRefresh.onRefreshEvent);
                }
            }
        }));
    };
    return PullToRefresh;
})(common.PullToRefresh);
exports.PullToRefresh = PullToRefresh;
