var common = require("./tab-view-common");
var trace = require("trace");
var types = require("utils/types");
var utils = require("utils/utils");
var imageSource = require("image-source");
var color = require("color");
var VIEWS_STATES = "_viewStates";
var ACCENT_COLOR = "colorAccent";
var PRIMARY_COLOR = "colorPrimary";
var DEFAULT_ELEVATION = 4;
global.moduleMerge(common, exports);
var TabViewItem = (function (_super) {
    __extends(TabViewItem, _super);
    function TabViewItem() {
        _super.apply(this, arguments);
    }
    TabViewItem.prototype._update = function () {
        if (this._parent) {
            this._parent._updateTabForItem(this);
        }
    };
    return TabViewItem;
})(common.TabViewItem);
exports.TabViewItem = TabViewItem;
var PagerAdapterClass = (function (_super) {
    __extends(PagerAdapterClass, _super);
    function PagerAdapterClass(owner, items) {
        _super.call(this);
        this.owner = owner;
        this.items = items;
        return global.__native(this);
    }
    PagerAdapterClass.prototype.getCount = function () {
        return this.items ? this.items.length : 0;
    };
    PagerAdapterClass.prototype.getPageTitle = function (index) {
        if (index < 0 || index >= this.items.length) {
            return "";
        }
        return this.items[index].title;
    };
    PagerAdapterClass.prototype.instantiateItem = function (container, index) {
        trace.write("TabView.PagerAdapter.instantiateItem; container: " + container + "; index: " + index, common.traceCategory);
        var item = this.items[index];
        if (item.view.parent !== this.owner) {
            this.owner._addView(item.view);
        }
        if (this[VIEWS_STATES]) {
            trace.write("TabView.PagerAdapter.instantiateItem; restoreHierarchyState: " + item.view, common.traceCategory);
            item.view.android.restoreHierarchyState(this[VIEWS_STATES]);
        }
        container.addView(item.view.android);
        return item.view.android;
    };
    PagerAdapterClass.prototype.destroyItem = function (container, index, _object) {
        trace.write("TabView.PagerAdapter.destroyItem; container: " + container + "; index: " + index + "; _object: " + _object, common.traceCategory);
        var item = this.items[index];
        var nativeView = item.view.android;
        if (nativeView.toString() !== _object.toString()) {
            throw new Error("Expected " + nativeView.toString() + " to equal " + _object.toString());
        }
        if (!this[VIEWS_STATES]) {
            this[VIEWS_STATES] = new android.util.SparseArray();
        }
        nativeView.saveHierarchyState(this[VIEWS_STATES]);
        container.removeView(nativeView);
        if (item.view.parent === this.owner) {
            this.owner._removeView(item.view);
        }
    };
    PagerAdapterClass.prototype.isViewFromObject = function (view, _object) {
        return view === _object;
    };
    PagerAdapterClass.prototype.saveState = function () {
        trace.write("TabView.PagerAdapter.saveState", common.traceCategory);
        var owner = this.owner;
        if (!owner || owner._childrenCount === 0) {
            return null;
        }
        if (!this[VIEWS_STATES]) {
            this[VIEWS_STATES] = new android.util.SparseArray();
        }
        var viewStates = this[VIEWS_STATES];
        var childCallback = function (view) {
            var nativeView = view.android;
            if (nativeView && nativeView.isSaveFromParentEnabled && nativeView.isSaveFromParentEnabled()) {
                nativeView.saveHierarchyState(viewStates);
            }
            return true;
        };
        owner._eachChildView(childCallback);
        var bundle = new android.os.Bundle();
        bundle.putSparseParcelableArray(VIEWS_STATES, viewStates);
        return bundle;
    };
    PagerAdapterClass.prototype.restoreState = function (state, loader) {
        trace.write("TabView.PagerAdapter.restoreState", common.traceCategory);
        var bundle = state;
        bundle.setClassLoader(loader);
        this[VIEWS_STATES] = bundle.getSparseParcelableArray(VIEWS_STATES);
    };
    return PagerAdapterClass;
})(android.support.v4.view.PagerAdapter);
;
var PageChangedListener = (function (_super) {
    __extends(PageChangedListener, _super);
    function PageChangedListener(owner) {
        _super.call(this);
        this._owner = owner;
        return global.__native(this);
    }
    PageChangedListener.prototype.onPageSelected = function (position) {
        this._owner.selectedIndex = position;
    };
    return PageChangedListener;
})(android.support.v4.view.ViewPager.SimpleOnPageChangeListener);
function selectedColorPropertyChanged(data) {
    var tabLayout = data.object._getAndroidTabView();
    if (tabLayout && data.newValue instanceof color.Color) {
        tabLayout.setSelectedIndicatorColors([data.newValue.android]);
    }
}
common.TabView.selectedColorProperty.metadata.onSetNativeValue = selectedColorPropertyChanged;
function tabsBackgroundColorPropertyChanged(data) {
    var tabLayout = data.object._getAndroidTabView();
    if (tabLayout && data.newValue instanceof color.Color) {
        tabLayout.setBackgroundColor(data.newValue.android);
    }
}
common.TabView.tabsBackgroundColorProperty.metadata.onSetNativeValue = tabsBackgroundColorPropertyChanged;
var TabView = (function (_super) {
    __extends(TabView, _super);
    function TabView() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TabView.prototype, "android", {
        get: function () {
            return this._grid;
        },
        enumerable: true,
        configurable: true
    });
    TabView.prototype._createUI = function () {
        trace.write("TabView._createUI(" + this + ");", common.traceCategory);
        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        this._tabLayout = new org.nativescript.widgets.TabLayout(this._context);
        this._grid.addView(this._tabLayout);
        this.setElevation();
        var accentColor = utils.ad.resources.getPalleteColor(ACCENT_COLOR, this._context);
        if (accentColor) {
            this._tabLayout.setSelectedIndicatorColors([accentColor]);
        }
        var primaryColor = utils.ad.resources.getPalleteColor(PRIMARY_COLOR, this._context);
        if (primaryColor) {
            this._tabLayout.setBackgroundColor(primaryColor);
        }
        this._viewPager = new android.support.v4.view.ViewPager(this._context);
        var lp = new org.nativescript.widgets.CommonLayoutParams();
        lp.row = 1;
        this._viewPager.setLayoutParams(lp);
        this._grid.addView(this._viewPager);
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._grid.setId(this._androidViewId);
        this._pageChagedListener = new PageChangedListener(this);
        this._viewPager.addOnPageChangeListener(this._pageChagedListener);
    };
    TabView.prototype.setElevation = function () {
        var compat = android.support.v4.view.ViewCompat;
        if (compat.setElevation) {
            var val = DEFAULT_ELEVATION * utils.layout.getDisplayDensity();
            compat.setElevation(this._grid, val);
            compat.setElevation(this._tabLayout, val);
        }
    };
    TabView.prototype._onItemsPropertyChangedSetNativeValue = function (data) {
        var _this = this;
        trace.write("TabView._onItemsPropertyChangedSetNativeValue(" + data.oldValue + " ---> " + data.newValue + ");", common.traceCategory);
        if (data.oldValue) {
            var oldItems = data.oldValue;
            oldItems.forEach(function (oldItem) { oldItem._parent = null; });
            this._viewPager.setAdapter(null);
            this._pagerAdapter = null;
            this._tabLayout.setItems(null, null);
        }
        if (data.newValue) {
            var items = data.newValue;
            var tabItems = new Array();
            items.forEach(function (item, idx, arr) {
                if (types.isNullOrUndefined(item.view)) {
                    throw new Error("View of TabViewItem at index " + idx + " is " + item.view);
                }
                item._parent = _this;
                tabItems.push(_this.createTabItem(item));
            });
            this._pagerAdapter = new PagerAdapterClass(this, data.newValue);
            this._viewPager.setAdapter(this._pagerAdapter);
            this._tabLayout.setItems(tabItems, this._viewPager);
        }
        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);
    };
    TabView.prototype._updateTabForItem = function (item) {
        if (this.items && this.items.length > 0) {
            var index = this.items.indexOf(item);
            if (index >= 0) {
                this._tabLayout.updateItemAt(index, this.createTabItem(item));
            }
        }
    };
    TabView.prototype._onSelectedIndexPropertyChangedSetNativeValue = function (data) {
        trace.write("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + data.oldValue + " ---> " + data.newValue + ");", common.traceCategory);
        _super.prototype._onSelectedIndexPropertyChangedSetNativeValue.call(this, data);
        var index = data.newValue;
        if (!types.isNullOrUndefined(index)) {
            var viewPagerSelectedIndex = this._viewPager.getCurrentItem();
            if (viewPagerSelectedIndex !== index) {
                trace.write("TabView this._viewPager.setCurrentItem(" + index + ", true);", common.traceCategory);
                this._viewPager.setCurrentItem(index, true);
            }
        }
        var args = { eventName: TabView.selectedIndexChangedEvent, object: this, oldIndex: data.oldValue, newIndex: data.newValue };
        this.notify(args);
    };
    TabView.prototype.createTabItem = function (item) {
        var result = new org.nativescript.widgets.TabItemSpec();
        result.title = item.title;
        if (item.iconSource) {
            if (item.iconSource.indexOf(utils.RESOURCE_PREFIX) === 0) {
                result.iconId = utils.ad.resources.getDrawableId(item.iconSource.substr(utils.RESOURCE_PREFIX.length));
            }
            else {
                var is = imageSource.fromFileOrResource(item.iconSource);
                if (is) {
                    result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
                }
            }
        }
        return result;
    };
    TabView.prototype._getAndroidTabView = function () {
        return this._tabLayout;
    };
    return TabView;
})(common.TabView);
exports.TabView = TabView;
