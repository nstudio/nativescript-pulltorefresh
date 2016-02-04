import definition = require("pulltorefresh");
import contentView = require("ui/content-view");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");
import platform = require("platform");
import utils = require("utils/utils");
import * as types from "utils/types";

export class PullToRefresh extends contentView.ContentView implements definition.PullToRefresh {
    public static onRefresh = "onRefresh";

    public static isRefreshingProperty = new dependencyObservable.Property(
        "isRefreshing",
        "SwipeRefreshLayout",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None)
    );

    constructor() {
        super();
    }

    //get radius(): number {
    //    return this._getValue(SwipeRefreshLayout.radiusProperty);
    //}
    //set radius(value: number) {
    //    this._setValue(SwipeRefreshLayout.radiusProperty, value);
    //}

    get isRefreshing(): boolean {
        return this._getValue(PullToRefresh.isRefreshingProperty);
    }

}