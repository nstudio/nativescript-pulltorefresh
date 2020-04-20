import { Color } from 'tns-core-modules/color';
import * as common from './pulltorefresh-common';

export * from './pulltorefresh-common';

declare const global: any;

const SwipeRefreshLayout_Namespace = useAndroidX()
  ? androidx.swiperefreshlayout.widget
  : (android.support.v4 as any).widget;

function useAndroidX() {
  return global.androidx && androidx.swiperefreshlayout;
}

class CarouselFriendlySwipeRefreshLayout extends SwipeRefreshLayout_Namespace.SwipeRefreshLayout {
  private _touchSlop: number;
  private _previousX: number;

  public constructor(
    context: android.content.Context,
    attrs: android.util.AttributeSet
  ) {
    super(context, attrs);

    this._touchSlop = android.view.ViewConfiguration.get(
      context
    ).getScaledTouchSlop();
  }

  public onInterceptTouchEvent(event: android.view.MotionEvent): boolean {
    switch (event.getAction()) {
      case android.view.MotionEvent.ACTION_DOWN: {
        this._previousX = android.view.MotionEvent.obtain(event).getX();
        break;
      }
      case android.view.MotionEvent.ACTION_MOVE: {
        const eventX = event.getX();
        const xDifference = Math.abs(eventX - this._previousX);

        if (xDifference > this._touchSlop) {
          return false;
        }

        break;
      }
    }

    return super.onInterceptTouchEvent(event);
  }
}

export class PullToRefresh extends common.PullToRefreshBase {
  private _androidViewId: number;

  public nativeView: androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

  get android(): androidx.swiperefreshlayout.widget.SwipeRefreshLayout {
    return this.nativeView;
  }

  public createNativeView() {
    const swipeRefreshLayout = new (CarouselFriendlySwipeRefreshLayout as any)(
      this._context
    );

    if (!this._androidViewId) {
      this._androidViewId = android.view.View.generateViewId();
    }
    swipeRefreshLayout.setId(this._androidViewId);

    // check if we're using android X to use the correct interfaced extended class below
    if (useAndroidX()) {
      const androidXListener = new androidx.swiperefreshlayout.widget.SwipeRefreshLayout.OnRefreshListener(
        {
          onRefresh() {
            const owner = this.owner.get();

            if (owner) {
              owner.refreshing = true;
              owner.notify({
                eventName: common.PullToRefreshBase.refreshEvent,
                object: owner
              });
            }
          }
        }
      );
      swipeRefreshLayout.setOnRefreshListener(androidXListener);
      (swipeRefreshLayout as any).refreshListener = androidXListener;
    } else {
      const supportListener = new (android.support
        .v4 as any).widget.SwipeRefreshLayout.OnRefreshListener({
        onRefresh(v) {
          const owner = this.owner.get();

          if (owner) {
            owner.refreshing = true;
            owner.notify({
              eventName: common.PullToRefreshBase.refreshEvent,
              object: owner
            });
          }
        }
      });
      swipeRefreshLayout.setOnRefreshListener(supportListener);
      (swipeRefreshLayout as any).refreshListener = supportListener;
    }

    return swipeRefreshLayout;
  }

  public initNativeView() {
    super.initNativeView();

    const nativeView = this.nativeView as any;
    nativeView.refreshListener.owner = new WeakRef(this);
  }

  public disposeNativeView() {
    const nativeView = this.nativeView as any;
    nativeView.refreshListener.owner = null;

    super.disposeNativeView();
  }

  [common.refreshingProperty.getDefault](): boolean {
    return false;
  }
  [common.refreshingProperty.setNative](value: boolean) {
    this.nativeView.setRefreshing(value);
  }

  [common.indicatorColorProperty.setNative](value: Color) {
    const color = value ? value.android : this.color;
    this.nativeView.setColorSchemeColors([color]);
  }

  [common.indicatorColorStyleProperty.setNative](value: Color) {
    // Inline property has priority
    if (this.indicatorColor)
    {
      return;
    }
    const color = value ? value.android : this.color;
    this.nativeView.setColorSchemeColors([color]);
  }

  [common.indicatorFillColorProperty.setNative](value: Color) {
    const color = value ? value.android : this.backgroundColor;
    this.nativeView.setProgressBackgroundColorSchemeColor(color);
  }

  [common.indicatorFillColorStyleProperty.setNative](value: Color) {
    // Inline property has priority
    if (this.indicatorFillColor)
    {
      return;
    }
    const color = value ? value.android : this.backgroundColor;
    this.nativeView.setProgressBackgroundColorSchemeColor(color);
  }
}