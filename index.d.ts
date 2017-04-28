import { ContentView } from 'ui/content-view';

export * from "ui/content-view";

/**
 * Contains the PullToRefresh class, which represents a Layout that contains the UI pattern for pull-to-refresh
 */
export class PullToRefresh extends ContentView {

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
    refreshControl?: any /// UIRefreshControl

    /*
    * Gets or sets if the view is refreshing
    */
    refreshing: boolean;
}