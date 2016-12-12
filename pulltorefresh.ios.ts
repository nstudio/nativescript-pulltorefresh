import common = require("./pulltorefresh-common");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import style = require("ui/styling/style");

function refreshingPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var pullRefresh = <PullToRefresh>data.object;
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

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.PullToRefresh.refreshingProperty.metadata).onSetNativeValue = refreshingPropertyChanged;

global.moduleMerge(common, exports);

class PullToRefreshHandler extends NSObject {
    public static ObjCExposedMethods = {
        "handleRefresh": { returns: interop.types.void, params: [UIRefreshControl] }    
    };
    
    private _owner: WeakRef<PullToRefresh>;
    
    public static initWithOnwer(owner: WeakRef<PullToRefresh>): PullToRefreshHandler {
        var impl = <PullToRefreshHandler>PullToRefreshHandler.new();
        impl._owner = owner;
        return impl;
    }
    
    public handleRefresh(refreshControl: UIRefreshControl) {
        var pullToRefresh = this._owner.get();
        pullToRefresh.refreshing = true;
        pullToRefresh._emit(common.PullToRefresh.refreshEvent);
    }
}

export class PullToRefresh extends common.PullToRefresh {
    private _refreshControl: UIRefreshControl;
    private _handler: PullToRefreshHandler;
    
    constructor() {
        super();
        
        this._refreshControl = new UIRefreshControl();
        this._handler = PullToRefreshHandler.initWithOnwer(new WeakRef(this));
        this._refreshControl.addTargetActionForControlEvents(this._handler, "handleRefresh", UIControlEvents.ValueChanged);
    }
    
    // NOTE: We ccannot use the default ios property as the UIRefreshControl can be added only to UIScrollViews!
    get refreshControl(): UIRefreshControl {
        return this._refreshControl
    }
        
    public onLoaded() {
        super.onLoaded();
        
        if (this.content.ios instanceof UIScrollView) {
            // Ensure that we can trigger the refresh, even if the content is not large enough
            this.content.ios.alwaysBounceVertical = true;
            
            this.content.ios.addSubview(this._refreshControl);
        }
        else if (this.content.ios instanceof UIWebView) {
            // Ensure that we can trigger the refresh, even if the content is not large enough
            this.content.ios.scrollView.alwaysBounceVertical = true;
            
            this.content.ios.scrollView.addSubview(this._refreshControl);
        }
        else {
            throw new Error("Content must inherit from UIScrollView!");
        }
    }
}

export class PullToRefreshStyler implements style.Styler {
    private static setBackgroundColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <UIRefreshControl>pullToRefresh.refreshControl;
        native.backgroundColor = value;
    }
    private static resetBackgroundColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <UIRefreshControl>pullToRefresh.refreshControl;
        native.backgroundColor = value;
    }
    
    private static setColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <UIRefreshControl>pullToRefresh.refreshControl;
        native.tintColor = value;
    }
    private static resetColor(pullToRefresh: PullToRefresh, value: any) {
        var native = <UIRefreshControl>pullToRefresh.refreshControl;
        native.tintColor = value;
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