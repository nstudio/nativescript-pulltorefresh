import {
  PullToRefreshBase,
  colorProperty,
  backgroundColorProperty,
  refreshingProperty
} from "./pulltorefresh-common";
import { Color } from "tns-core-modules/color";

export * from "./pulltorefresh-common";

export class PullToRefresh extends PullToRefreshBase {
  private _androidViewId: number;

  public nativeView: any; // android.support.v4.widget.SwipeRefreshLayout;

  get android(): any {
    return this.nativeView; // android.support.v4.widget.SwipeRefreshLayout
  }

  public createNativeView() {
    const swipeRefreshLayout = new (android.support.v4
      .widget as any).SwipeRefreshLayout(this._context);

    if (!this._androidViewId) {
      this._androidViewId = android.view.View.generateViewId();
    }
    swipeRefreshLayout.setId(this._androidViewId);

    const refreshListener = new TNS_SwipeRefreshListener(new WeakRef(this));
    swipeRefreshLayout.setOnRefreshListener(refreshListener);
    (swipeRefreshLayout as any).refreshListener = refreshListener;

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

  [refreshingProperty.getDefault](): boolean {
    return false;
  }
  [refreshingProperty.setNative](value: boolean) {
    this.nativeView.setRefreshing(value);
  }

  [colorProperty.setNative](value: Color | number) {
    const color = value instanceof Color ? value.android : value;
    this.nativeView.setColorSchemeColors([color]);
  }

  [backgroundColorProperty.setNative](value: Color | number) {
    const color = value instanceof Color ? value.android : value;
    this.nativeView.setProgressBackgroundColorSchemeColor(color);
  }
}

@Interfaces([
  (android.support.v4.widget as any).SwipeRefreshLayout.OnRefreshListener
])
// tslint:disable-next-line:class-name
class TNS_SwipeRefreshListener extends java.lang.Object {
  constructor(private owner: WeakRef<PullToRefresh>) {
    super();

    return global.__native(this);
  }

  public onRefresh(v) {
    const owner = this.owner.get();

    if (owner) {
      owner.refreshing = true;
      owner.notify({
        eventName: PullToRefreshBase.refreshEvent,
        object: owner
      });
    }
  }
}
