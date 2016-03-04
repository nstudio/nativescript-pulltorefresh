/**
 * Contains the PullToRefresh class, which represents a Layout that contains the UI pattern for pull-to-refresh
 */
declare module "pulltorefresh" {
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

        /*
        * Gets or sets if the view is refreshing
        */
        refreshing: boolean;

        /*
        //* Notify the widget that refresh state has changed.
        //*/
        //setRefreshing: boolean;

        /**
         * Raised when a refresh event occurs.
         */
        on(event: "refresh", callback: (args: observable.EventData) => void, thisArg?: any);
    }

}