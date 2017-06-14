import { PullToRefreshBase, refreshingProperty, colorProperty, backgroundColorProperty } from "./pulltorefresh-common";
import { Color } from "color";

export * from "./pulltorefresh-common";

export class PullToRefresh extends PullToRefreshBase {
    private _androidViewId: number;

    public nativeView: android.support.v4.widget.SwipeRefreshLayout;

    get android(): android.support.v4.widget.SwipeRefreshLayout {
        return this.nativeView;
    }
    
    public createNativeView() { 
        const swipeRefreshLayout = new android.support.v4.widget.SwipeRefreshLayout(this._context);

        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        swipeRefreshLayout.setId(this._androidViewId);

        const refreshListener = new SewipeRefreshListener(new WeakRef(this));
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

@Interfaces([android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener])
class SewipeRefreshListener extends java.lang.Object implements android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener {
    constructor(private owner: WeakRef<PullToRefresh>) {
        super();

        return global.__native(this);
    }

    public onRefresh(v) {
        var owner = this.owner.get();

        if (owner) {
            owner.refreshing = true;
            owner.notify({
                eventName: PullToRefreshBase.refreshEvent,
                object: owner
            });
        }
    }
}