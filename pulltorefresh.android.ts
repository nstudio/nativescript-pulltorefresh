import common = require("./pulltorefresh-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import color = require("color");
import view = require("ui/core/view");


function refreshingPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var pullRefresh = <PullToRefresh>data.object;
    if (!pullRefresh.android) {
        return;
    }

    pullRefresh.android.setRefreshing(data.newValue);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.PullToRefresh.refreshingProperty.metadata).onSetNativeValue = refreshingPropertyChanged;


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

    //Visibility methods
    public setRefreshing(newValue: boolean) {
        this._android.setRefreshing(newValue);
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
                var owner = that.get();
                if (owner) {
                    owner._emit(common.PullToRefresh.refreshEvent);
                }
            }
        }));
                     
    }

}