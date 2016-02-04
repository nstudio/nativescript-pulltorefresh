import common = require("./pulltorefresh-common");
import Color = require("color");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as enumsModule from "ui/enums";
import view = require("ui/core/view");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class PullToRefresh extends common.PullToRefresh {
    private _android: android.support.v4.widget.SwipeRefreshLayout;

    constructor() {
        super();
    }

    get android(): android.support.v4.widget.SwipeRefreshLayout {
        return this._android;
    }

    get _nativeView(): android.support.v4.widget.SwipeRefreshLayout {
        return this._android;
    }

    public _createUI() {

        var that = new WeakRef(this);
        console.log('that: ' + that);

        this._android = new android.support.v4.widget.SwipeRefreshLayout(this._context);

        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
            console.log('_androidViewId: ' + this._androidViewId);
        }
        this._android.setId(this._androidViewId);


        //if (this.color) {
        //    //var Color = android.graphics.Color;
        //    this._android.setColorSchemeColors(this.color.android, this.color.android, this.color.android, this.color.android);
        //}


        if (this.onRefreshEvent) {
            console.log('this.onRefreshEvent = ' + this.onRefreshEvent);

            this._android.setOnRefreshListener(new android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener(
                {
                    get owner() {
                        return that.get();
                    },

                    onRefresh: function (v) {
                        console.log('onRefresh: (v) = ' + v);
                        //if (this.owner) {
                        console.log('this.owner._emit() = ' + common.PullToRefresh.refreshEvent);
                            this.owner._emit(common.PullToRefresh.refreshEvent);
                        //}
                    }
                }));
        }
     
    }
}