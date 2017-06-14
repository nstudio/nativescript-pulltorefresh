import {
  PullToRefreshBase,
  refreshingProperty,
  colorProperty,
  backgroundColorProperty
} from "./pulltorefresh-common";
import { Color } from "color";

export * from "./pulltorefresh-common";

class PullToRefreshHandler extends NSObject {
  public static ObjCExposedMethods = {
    handleRefresh: { returns: interop.types.void, params: [UIRefreshControl] }
  };

  private _owner: WeakRef<PullToRefresh>;

  public static initWithOnwer(
    owner: WeakRef<PullToRefresh>
  ): PullToRefreshHandler {
    var impl = <PullToRefreshHandler>PullToRefreshHandler.new();
    impl._owner = owner;
    return impl;
  }

  public handleRefresh(refreshControl: UIRefreshControl) {
    var pullToRefresh = this._owner.get();
    pullToRefresh.refreshing = true;
    pullToRefresh.notify({
      eventName: PullToRefreshBase.refreshEvent,
      object: pullToRefresh
    });
  }
}

export class PullToRefresh extends PullToRefreshBase {
  private _handler: PullToRefreshHandler;

  // NOTE: We cannot use the default ios property as the UIRefreshControl can be added only to UIScrollViews!
  public refreshControl: UIRefreshControl;

  constructor() {
    super();

    this.refreshControl = UIRefreshControl.alloc().init();
    this._handler = PullToRefreshHandler.initWithOnwer(new WeakRef(this));
    this.refreshControl.addTargetActionForControlEvents(
      this._handler,
      "handleRefresh",
      UIControlEvents.ValueChanged
    );
  }

  public onLoaded() {
    super.onLoaded();

    if (this.content.ios instanceof UIScrollView) {
      // ensure that we can trigger the refresh, even if the content is not large enough
      this.content.ios.alwaysBounceVertical = true;

      this.content.ios.addSubview(this.refreshControl);
    } else if (this.content.ios instanceof UIWebView) {
      // ensure that we can trigger the refresh, even if the content is not large enough
      this.content.ios.scrollView.alwaysBounceVertical = true;

      this.content.ios.scrollView.addSubview(this.refreshControl);
    } else {
      throw new Error("Content must inherit from UIScrollView!");
    }
  }

  [refreshingProperty.getDefault](): boolean {
    return false;
  }
  [refreshingProperty.setNative](value: boolean) {
    if (value) {
      this.refreshControl.beginRefreshing();
    } else {
      this.refreshControl.endRefreshing();
    }
  }

  [colorProperty.getDefault](): UIColor {
    return this.refreshControl.tintColor;
  }
  [colorProperty.setNative](value: Color | UIColor) {
    const color = value instanceof Color ? value.ios : value;

    this.refreshControl.tintColor = color;
  }

  [backgroundColorProperty.getDefault](): UIColor {
    return this.refreshControl.backgroundColor;
  }
  [backgroundColorProperty.setNative](value: Color | UIColor) {
    const color = value instanceof Color ? value.ios : value;

    this.refreshControl.backgroundColor = color;
  }
}
