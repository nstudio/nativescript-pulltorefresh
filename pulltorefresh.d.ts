/**
 * Contains the PullToRefresh class, which represents a Layout that contains the UI pattern for pull-to-refresh
 */
declare module "nativescript-pulltorefresh" {
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");
    import observable = require("data/observable");
    import contentView = require("ui/content-view");
    
    /**
     * Represents a standard PullToRefresh Layout
     */
    export class PullToRefresh extends contentView.ContentView {
        public static isRefreshingProperty: dependencyObservable.Property;

        /**
         * String value used when hooking to the onRefresh event.
         */
        public static refreshEvent: string;
       
        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/widget/SwipeRefreshLayout.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.support.v4.widget.SwipeRefreshLayout */;
        
        /**
         * Because of iOS specific this returns the basic UIView. In order to access UIRefreshControl use the refreshControl property!
         */
        ios: any
        
        /**
         * Returns the native iOS UIRefreshControl
         */
        refreshControl: UIRefreshControl
        
        /*
        * Gets or sets if the view is refreshing
        */
        refreshing: boolean;

        /**
         * Raised when a refresh event occurs.
         */
        on(event: string, callback: (args: observable.EventData) => void, thisArg?: any);
        on(event: "refresh", callback: (args: observable.EventData) => void, thisArg?: any);
    }

}
