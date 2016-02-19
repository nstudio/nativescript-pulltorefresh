import definition = require("pulltorefresh");
import contentView = require("ui/content-view");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");
import color = require("color");
import platform = require("platform");
import utils = require("utils/utils");
import * as types from "utils/types";

export class PullToRefresh extends contentView.ContentView implements definition.PullToRefresh {
    public static refreshEvent = "refresh";

    public static refreshingProperty = new dependencyObservable.Property(
        "refreshing",
        "PullToRefresh",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None)
    );

    public static colorProperty = new dependencyObservable.Property(
        "color", 
        "PullToRefresh",
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None)
    );

    constructor(options?: definition.Options) {
        super(options);
    }

    get color(): any {
        return this._getValue(PullToRefresh.colorProperty);
    }
    set color(value: any) {
        this._setValue(PullToRefresh.colorProperty, value);
    }

    get refreshing(): boolean {
        return this._getValue(PullToRefresh.refreshingProperty);
    }

    set refreshing(value: boolean) {
        this._setValue(PullToRefresh.refreshingProperty.value);
    }

}