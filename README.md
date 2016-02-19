# NativeScript-PullToRefresh :recycle:
NativeScript plugin to use Pull to Refresh on any view. 

**Android Only - PRs welcome for iOS**.

#### [Android SwipeRefreshLayout](http://developer.android.com/reference/android/support/v4/widget/SwipeRefreshLayout.html)
##### [Material Design Indicators Spec](https://www.google.com/design/spec/components/progress-activity.html#progress-activity-types-of-indicators)


## Sample Screen

![PullToRefresh](screens/pullrefresh.gif)

## Installation
`npm install nativescript-pulltorefresh`

## Usage

###
```XML
<page xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:PullRefresh="nativescript-pulltorefresh"
      loaded="pageLoaded">
    <page.actionBar>
        <action-bar title="Pull To Refresh :)" backgroundColor="#2196F3" color="#f1f1f1" />
    </page.actionBar>
    <stack-layout>   
        <PullRefresh:PullToRefresh refresh="refreshList">
            <list-view items="{{ users }}">
                <list-view.itemTemplate>
                    <label text="{{ name }}" row="0" col="1" textWrap="true" class="message" />                            
                </list-view.itemTemplate>
            </list-view>
        </PullRefresh:PullToRefresh>        
    </stack-layout>
</page>
```

###
```JS
function refreshList(args) {

    // Get reference to the PullToRefresh;
    var pullRefresh = args.object;

    // Do work here... and when done call .setRefreshing(false) to stop the refreshing
    loadItems().then(function (resp) {
        // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
        setTimeout(function () {
            pullRefresh.setRefreshing(false);
        }, 1000);
    }, function (err) {
        pullRefresh.setRefreshing(false);
    });
}
exports.refreshList = refreshList;
```


## Attributes
**refresh : function** *required*

## API

### setRefreshing

Notifies the widget that the refresh state has changed.

### TODO

- Add color property to set the color indicator