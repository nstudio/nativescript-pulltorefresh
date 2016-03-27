import definition = require("pulltorefresh");
import contentView = require("ui/content-view");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");

export class PullToRefresh extends contentView.ContentView implements definition.PullToRefresh {
    public static refreshEvent = "refresh";

    public static refreshingProperty = new dependencyObservable.Property(
        "refreshing",
        "PullToRefresh",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None)
    );

    constructor(options?: view.Options) {
        super(options);
    }

    get refreshing(): boolean {
        return this._getValue(PullToRefresh.refreshingProperty);
    }

    set refreshing(value: boolean) {
        this._setValue(PullToRefresh.refreshingProperty, value);
    }
    
    public _addChildFromBuilder(name: string, value: any) {
        // Copy inheirtable style property values
        var originalColor = value.style.color || null;
        
        if (value instanceof view.View) {
            this.content = value;
        }
        
        // Reset inheritable style property values as we do not want those to be inherited
        value.style.color = originalColor;
    }
}