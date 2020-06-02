import { ios as iosUtils } from 'tns-core-modules/utils/utils';
import * as common from './pulltorefresh-common';

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
      eventName: common.PullToRefreshBase.refreshEvent,
      object: pullToRefresh
    });
  }
}

const SUPPORT_REFRESH_CONTROL = iosUtils.MajorVersion >= 10;

export class PullToRefresh extends common.PullToRefreshBase {
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
    } else if (this.content.ios instanceof WKWebView) {
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
        'Content must inherit from either UIScrollView or WKWebView!'
      );
    }
  }

  [common.refreshingProperty.getDefault](): boolean {
    return false;
  }
  [common.refreshingProperty.setNative](value: boolean) {
    if (value) {
      this.refreshControl.beginRefreshing();
    } else {
      this.refreshControl.endRefreshing();
    }
  }

  [common.indicatorColorProperty.getDefault](): UIColor {
    return this.refreshControl.tintColor;
  }

  [common.indicatorColorProperty.setNative](value: any) {
    const color = value ? value.ios : this.color;
    this.refreshControl.tintColor = color;
  }

  [common.indicatorColorStyleProperty.getDefault](): UIColor {
    return this.refreshControl.tintColor;
  }

  [common.indicatorColorStyleProperty.setNative](value: any) {
    // Inline property has priority
    if ((this as any).indicatorColor)
    {
      return;
    }
    const color = value ? value.ios : this.color;
    this.refreshControl.tintColor = color;
  }

  [common.indicatorFillColorProperty.getDefault](): UIColor {
    return this.refreshControl.backgroundColor;
  }

  [common.indicatorFillColorProperty.setNative](value: any) {
    const color = value ? value.ios : this.backgroundColor;
    this.refreshControl.backgroundColor = color;
  }

  [common.indicatorFillColorStyleProperty.getDefault](): UIColor {
    return this.refreshControl.backgroundColor;
  }

  [common.indicatorFillColorStyleProperty.setNative](value: any) {
    // Inline property has priority
    if ((this as any).indicatorFillColor)
    {
      return;
    }
    const color = value ? value.ios : this.backgroundColor;
    this.refreshControl.backgroundColor = color;
  }
}