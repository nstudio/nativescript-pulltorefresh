import common = require("./pulltorefresh-common");

global.moduleMerge(common, exports);

export class PullToRefresh extends common.PullToRefresh {
    private _android: android.support.v4.widget.SwipeRefreshLayout;

    constructor() {
        super();
    }

    get android(): android.support.v4.widget.SwipeRefreshLayout {
        return this._android;
    }

    get _nativeView(): android.support.v4.widget.SwipeRefreshLayout {
        return this._android;
    }

    public _createUI() {

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
                     
    }

}