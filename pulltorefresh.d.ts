/**
 * Contains the CardView class, which represents a FrameLayout with a rounded corner background and shadow.
 */
declare module "pulltorefresh" {
    import view = require("ui/core/view");
     
    /**
     * Represents a standard CardView widget.
     */
    export class PullToRefresh extends view.View implements view.AddChildFromBuilder {
       
        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/widget/SwipeRefreshLayout.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.support.v4.widget.SwipeRefreshLayout */;

        /**
         * Gets or sets listener when a refresh is triggered via swipe gesture
         */
        onRefreshListener: any; /* android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener */

        /*
        * Gets or sets if the view is refreshing
        */
        isRefreshing: boolean;

        /*
        * Gets or sets if the view is refreshing
        */
        setRefreshing: boolean;

        /**
         * Raised when a tap event occurs.
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