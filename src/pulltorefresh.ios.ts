/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/nativescript-ui-listview/platforms/ios/typings/listview.d.ts" />

import { device } from 'tns-core-modules/platform';
import { Color } from 'tns-core-modules/color';
import {
  PullToRefreshBase,
  backgroundColorProperty,
  colorProperty,
  refreshingProperty
} from './pulltorefresh-common';

export * from './pulltorefresh-common';

class PullToRefreshHandler extends NSObject {
  public static ObjCExposedMethods = {
    handleRefresh: { returns: interop.types.void, params: [UIRefreshControl] }
  };

  private _owner: WeakRef<PullToRefresh>;

  public static initWithOnwer(
    owner: WeakRef<PullToRefresh>
  ): PullToRefreshHandler {
    const impl = <PullToRefreshHandler>PullToRefreshHandler.new();
    impl._owner = owner;
    return impl;
  }

  public handleRefresh(refreshControl: UIRefreshControl) {
    const pullToRefresh = this._owner.get();
    pullToRefresh.refreshing = true;
    pullToRefresh.notify({
      eventName: PullToRefreshBase.refreshEvent,
      object: pullToRefresh
    });
  }
}

const SUPPORT_REFRESH_CONTROL = parseFloat(device.osVersion) >= 10.0;

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
      'handleRefresh',
      UIControlEvents.ValueChanged
    );
  }

  public onLoaded() {
    super.onLoaded();

    if (this.content.ios instanceof UIScrollView) {
      if (SUPPORT_REFRESH_CONTROL) {
        this.content.ios.refreshControl = this.refreshControl;
      } else {
        // ensure that we can trigger the refresh, even if the content is not large enough
        this.content.ios.alwaysBounceVertical = true;

        this.content.ios.addSubview(this.refreshControl);
      }
    } else if (this.content.ios instanceof UIWebView) {
      if (SUPPORT_REFRESH_CONTROL) {
        this.content.ios.scrollView.refreshControl = this.refreshControl;
      } else {
        // ensure that we can trigger the refresh, even if the content is not large enough
        this.content.ios.scrollView.alwaysBounceVertical = true;

        this.content.ios.scrollView.addSubview(this.refreshControl);
      }
    } else if (
      typeof TKListView !== 'undefined' &&
      this.content.ios instanceof TKListView
    ) {
      if (SUPPORT_REFRESH_CONTROL) {
        this.content.ios.collectionView.refreshControl = this.refreshControl;
      } else {
        // ensure that we can trigger the refresh, even if the content is not large enough
        this.content.ios.collectionView.alwaysBounceVertical = true;

        this.content.ios.collectionView.addSubview(this.refreshControl);
      }
    } else if (this.content.ios instanceof WKWebView) {
      if (SUPPORT_REFRESH_CONTROL) {
        this.content.ios.scrollView.refreshControl = this.refreshControl;
      } else {
        // ensure that we can trigger the refresh, even if the content is not large enough
        this.content.ios.scrollView.alwaysBounceVertical = true;

        this.content.ios.scrollView.addSubview(this.refreshControl);
      }
    } else {
      throw new Error(
        'Content must inherit from either UIScrollView, UIWebView or WKWebView!'
      );
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
