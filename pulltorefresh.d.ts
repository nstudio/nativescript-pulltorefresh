/**
 * Contains the PullToRefresh class, which represents a Layout that contains the UI pattern for pull-to-refresh
 */
declare module "pulltorefresh" {
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");
    import observable = require("data/observable");

    /**
     * Represents a standard PullToRefresh Layout
     */
    export class PullToRefresh extends view.View implements view.AddChildFromBuilder {
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
         * Gets or sets listener when a refresh is triggered via swipe gesture
         */
        onRefreshListener: any; /* android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener */

        /*
        * Gets or sets the color to use in the progress animation
        */
        color: any;

        /*
        * Gets or sets if the view is refreshing
        */
        isRefreshing: boolean;

        /*
        * Notify the widget that refresh state has changed.
        */
        setRefreshing: boolean;

        /**
         * Raised when a refresh event occurs.
         */
        on(event: "refresh", callback: (args: observable.EventData) => void, thisArg?: any);


        /**
        * Called for every child element declared in xml.
        * This method will add a child element (value) to current element.
        * @param name - Name of the element.
        * @param value - Value of the element.
        */
        _addChildFromBuilder(name: string, value: any): void;
    }

}