import common = require("./pulltorefresh-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import style = require("ui/styling/style");


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
    private _androidViewId: number;
    
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

        this._android.setOnRefreshListener(new android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener({
            get owner() {
                return that.get();
            },

            onRefresh: function (v) {
                var owner = that.get();
                if (owner) {
                    owner.refreshing = true;
                    owner._emit(common.PullToRefresh.refreshEvent);
                }
            }
        }));
    }
}

export class PullToRefreshStyler implements style.Styler {
    private static setBackgroundColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <android.support.v4.widget.SwipeRefreshLayout>pullToRefresh._nativeView;
        native.setProgressBackgroundColorSchemeColor(value);
    }
    private static resetBackgroundColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <android.support.v4.widget.SwipeRefreshLayout>pullToRefresh._nativeView;
        native.setProgressBackgroundColorSchemeColor(value);
    }
    
    private static setColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <android.support.v4.widget.SwipeRefreshLayout>pullToRefresh._nativeView;        
        native.setColorSchemeColors([value]);
    }
    private static resetColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <android.support.v4.widget.SwipeRefreshLayout>pullToRefresh._nativeView;
        native.setColorSchemeColors([value]);
    }
    
    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, 
            new style.StylePropertyChangedHandler(PullToRefreshStyler.setBackgroundColor, 
                PullToRefreshStyler.resetBackgroundColor), 
            "PullToRefresh");
        style.registerHandler(style.backgroundInternalProperty, 
            style.ignorePropertyHandler, 
            "PullToRefresh");
        style.registerHandler(style.colorProperty, 
            new style.StylePropertyChangedHandler(PullToRefreshStyler.setColor, 
                PullToRefreshStyler.resetColor), 
            "PullToRefresh");
    }
}
PullToRefreshStyler.registerHandlers();