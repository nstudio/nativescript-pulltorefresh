var frameCommon = require("./frame-common");
var trace = require("trace");
var observable = require("data/observable");
var utils = require("utils/utils");
var application = require("application");
var types = require("utils/types");
global.moduleMerge(frameCommon, exports);
var TAG = "_fragmentTag";
var OWNER = "_owner";
var HIDDEN = "_hidden";
var INTENT_EXTRA = "com.tns.activity";
var ANDROID_FRAME = "android_frame";
var BACKSTACK_TAG = "_backstackTag";
var NAV_DEPTH = "_navDepth";
var CLEARING_HISTORY = "_clearingHistory";
var activityInitialized = false;
var navDepth = -1;
var PageFragmentBody = android.app.Fragment.extend({
    onCreate: function (savedInstanceState) {
        trace.write("PageFragmentBody.onCreate(" + savedInstanceState + ")", trace.categories.NativeLifecycle);
        this.super.onCreate(savedInstanceState);
        this.super.setHasOptionsMenu(true);
    },
    onCreateView: function (inflater, container, savedInstanceState) {
        trace.write("PageFragmentBody.onCreateView(" + inflater + ", " + container + ", " + savedInstanceState + ")", trace.categories.NativeLifecycle);
        var entry = this.entry;
        var page = entry.resolvedPage;
        if (savedInstanceState && savedInstanceState.getBoolean(HIDDEN, false)) {
            this.super.getFragmentManager().beginTransaction().hide(this).commit();
            page._onAttached(this.getActivity());
        }
        else {
            onFragmentShown(this);
        }
        return page._nativeView;
    },
    onHiddenChanged: function (hidden) {
        trace.write("PageFragmentBody.onHiddenChanged(" + hidden + ")", trace.categories.NativeLifecycle);
        this.super.onHiddenChanged(hidden);
        if (hidden) {
            onFragmentHidden(this);
        }
        else {
            onFragmentShown(this);
        }
    },
    onSaveInstanceState: function (outState) {
        trace.write("PageFragmentBody.onSaveInstanceState(" + outState + ")", trace.categories.NativeLifecycle);
        this.super.onSaveInstanceState(outState);
        if (this.isHidden()) {
            outState.putBoolean(HIDDEN, true);
        }
    },
    onDestroyView: function () {
        trace.write("PageFragmentBody.onDestroyView()", trace.categories.NativeLifecycle);
        this.super.onDestroyView();
        onFragmentHidden(this);
    },
    onDestroy: function () {
        trace.write("PageFragmentBody.onDestroy()", trace.categories.NativeLifecycle);
        this.super.onDestroy();
        utils.GC();
    }
});
function onFragmentShown(fragment) {
    trace.write("onFragmentShown(" + fragment.toString() + ")", trace.categories.NativeLifecycle);
    if (fragment[CLEARING_HISTORY]) {
        trace.write(fragment.toString() + " has been shown, but we are currently clearing history. Returning.", trace.categories.NativeLifecycle);
        return null;
    }
    var frame = fragment.frame;
    var entry = fragment.entry;
    var page = entry.resolvedPage;
    var currentNavigationContext;
    var navigationQueue = frame._navigationQueue;
    for (var i = 0; i < navigationQueue.length; i++) {
        if (navigationQueue[i].entry === entry) {
            currentNavigationContext = navigationQueue[i];
            break;
        }
    }
    var isBack = currentNavigationContext ? currentNavigationContext.isBackNavigation : false;
    frame._currentEntry = entry;
    frame._addView(page);
    if (!frame.isLoaded) {
        frame.onLoaded();
    }
    page.onNavigatedTo(isBack);
    frame._processNavigationQueue(page);
}
function onFragmentHidden(fragment) {
    trace.write("onFragmentHidden(" + fragment.toString() + ")", trace.categories.NativeLifecycle);
    if (fragment[CLEARING_HISTORY]) {
        trace.write(fragment.toString() + " has been hidden, but we are currently clearing history. Returning.", trace.categories.NativeLifecycle);
        return null;
    }
    var entry = fragment.entry;
    var page = entry.resolvedPage;
    if (page && page.frame) {
        var frame = page.frame;
        frame._removeView(page);
    }
}
var Frame = (function (_super) {
    __extends(Frame, _super);
    function Frame() {
        _super.call(this);
        this._isFirstNavigation = false;
        this._containerViewId = android.view.View.generateViewId();
        this._android = new AndroidFrame(this);
    }
    Object.defineProperty(Frame, "defaultAnimatedNavigation", {
        get: function () {
            return frameCommon.Frame.defaultAnimatedNavigation;
        },
        set: function (value) {
            frameCommon.Frame.defaultAnimatedNavigation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "containerViewId", {
        get: function () {
            return this._containerViewId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Frame.prototype, "_nativeView", {
        get: function () {
            return this._android.rootViewGroup;
        },
        enumerable: true,
        configurable: true
    });
    Frame.prototype._navigateCore = function (backstackEntry) {
        trace.write("_navigateCore; id: " + backstackEntry.resolvedPage.id + "; backstackVisible: " + this._isEntryBackstackVisible(backstackEntry) + "; clearHistory: " + backstackEntry.entry.clearHistory + ";", trace.categories.Navigation);
        var activity = this._android.activity;
        if (!activity) {
            var currentActivity = this._android.currentActivity;
            if (currentActivity) {
                startActivity(currentActivity, backstackEntry.entry);
            }
            this._delayedNavigationEntry = backstackEntry;
            return;
        }
        var manager = activity.getFragmentManager();
        if (backstackEntry.entry.clearHistory && !this._isFirstNavigation) {
            var backStackEntryCount = manager.getBackStackEntryCount();
            var i = backStackEntryCount - 1;
            var fragment;
            while (i >= 0) {
                fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
                trace.write(fragment.toString() + "[CLEARING_HISTORY] = true;", trace.categories.NativeLifecycle);
                fragment[CLEARING_HISTORY] = true;
            }
            if (this.currentPage) {
                fragment = manager.findFragmentByTag(this.currentPage[TAG]);
                if (fragment) {
                    fragment[CLEARING_HISTORY] = true;
                    trace.write(fragment.toString() + "[CLEARING_HISTORY] = true;", trace.categories.NativeLifecycle);
                }
            }
            if (backStackEntryCount) {
                var firstEntryName = manager.getBackStackEntryAt(0).getName();
                trace.write("manager.popBackStack(" + firstEntryName + ", android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);", trace.categories.NativeLifecycle);
                manager.popBackStack(firstEntryName, android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
            }
            this._currentEntry = null;
            navDepth = -1;
        }
        navDepth++;
        var fragmentTransaction = manager.beginTransaction();
        var newFragmentTag = "fragment" + navDepth;
        var newFragment = new PageFragmentBody();
        newFragment.frame = this;
        newFragment.entry = backstackEntry;
        backstackEntry[BACKSTACK_TAG] = newFragmentTag;
        backstackEntry[NAV_DEPTH] = navDepth;
        backstackEntry.resolvedPage[TAG] = newFragmentTag;
        trace.write("Frame<" + this._domId + ">.fragmentTransaction PUSH depth = " + navDepth, trace.categories.Navigation);
        if (this._isFirstNavigation) {
            fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
            trace.write("fragmentTransaction.add(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
        }
        else {
            if (this.android.cachePagesOnNavigate && !backstackEntry.entry.clearHistory) {
                var currentFragmentTag = this.currentPage[TAG];
                var currentFragment = manager.findFragmentByTag(currentFragmentTag);
                if (currentFragment) {
                    fragmentTransaction.hide(currentFragment);
                    trace.write("fragmentTransaction.hide(" + currentFragment + ");", trace.categories.NativeLifecycle);
                }
                else {
                    trace.write("Could not find " + currentFragmentTag + " to hide", trace.categories.NativeLifecycle);
                }
                fragmentTransaction.add(this.containerViewId, newFragment, newFragmentTag);
                trace.write("fragmentTransaction.add(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
            }
            else {
                fragmentTransaction.replace(this.containerViewId, newFragment, newFragmentTag);
                trace.write("fragmentTransaction.replace(" + this.containerViewId + ", " + newFragment + ", " + newFragmentTag + ");", trace.categories.NativeLifecycle);
            }
            if (this.backStack.length > 0 && this._currentEntry) {
                var backstackTag = this._currentEntry[BACKSTACK_TAG];
                fragmentTransaction.addToBackStack(backstackTag);
                trace.write("fragmentTransaction.addToBackStack(" + backstackTag + ");", trace.categories.NativeLifecycle);
            }
        }
        if (!this._isFirstNavigation) {
            var animated = this._getIsAnimatedNavigation(backstackEntry.entry);
            if (this.android.cachePagesOnNavigate) {
                fragmentTransaction.setTransition(android.app.FragmentTransaction.TRANSIT_NONE);
            }
            else {
                var transition = animated ? android.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN : android.app.FragmentTransaction.TRANSIT_NONE;
                fragmentTransaction.setTransition(transition);
            }
        }
        fragmentTransaction.commit();
        trace.write("fragmentTransaction.commit();", trace.categories.NativeLifecycle);
    };
    Frame.prototype._goBackCore = function (backstackEntry) {
        navDepth = backstackEntry[NAV_DEPTH];
        trace.write("Frame<" + this._domId + ">.fragmentTransaction POP depth = " + navDepth, trace.categories.Navigation);
        var manager = this._android.activity.getFragmentManager();
        if (manager.getBackStackEntryCount() > 0) {
            manager.popBackStack(backstackEntry[BACKSTACK_TAG], android.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    };
    Frame.prototype._createUI = function () {
    };
    Frame.prototype._onActivityCreated = function (isRestart) {
        this._onAttached(this._android.activity);
        var backstackEntry = this._currentEntry || this._delayedNavigationEntry;
        if (isRestart) {
            this._onNavigatingTo(backstackEntry, false);
            this._onNavigatedTo(backstackEntry, false);
        }
        else {
            this._isFirstNavigation = true;
            this._navigateCore(backstackEntry);
            this._isFirstNavigation = false;
        }
        this._delayedNavigationEntry = undefined;
    };
    Frame.prototype._popFromFrameStack = function () {
        if (!this._isInFrameStack) {
            return;
        }
        _super.prototype._popFromFrameStack.call(this);
        if (this._android.hasOwnActivity) {
            this._android.activity.finish();
        }
    };
    Frame.prototype._clearAndroidReference = function () {
    };
    Frame.prototype._printNativeBackStack = function () {
        if (!this._android.activity) {
            return;
        }
        var manager = this._android.activity.getFragmentManager();
        var length = manager.getBackStackEntryCount();
        var i = length - 1;
        console.log("---------------------------");
        console.log("Fragment Manager Back Stack (" + length + ")");
        while (i >= 0) {
            var fragment = manager.findFragmentByTag(manager.getBackStackEntryAt(i--).getName());
            console.log("[ " + fragment.toString() + " ]");
        }
    };
    Frame.prototype._printFrameBackStack = function () {
        var length = this.backStack.length;
        var i = length - 1;
        console.log("---------------------------");
        console.log("Frame Back Stack (" + length + ")");
        while (i >= 0) {
            var backstackEntry = this.backStack[i--];
            console.log("[ " + backstackEntry.resolvedPage.id + " ]");
        }
    };
    Frame.prototype._getNavBarVisible = function (page) {
        if (types.isDefined(page.actionBarHidden)) {
            return !page.actionBarHidden;
        }
        if (this._android && types.isDefined(this._android.showActionBar)) {
            return this._android.showActionBar;
        }
        return true;
    };
    return Frame;
})(frameCommon.Frame);
exports.Frame = Frame;
var NativeActivity = {
    get frame() {
        if (this.androidFrame) {
            return this.androidFrame.owner;
        }
        return null;
    },
    get androidFrame() {
        return this[ANDROID_FRAME];
    },
    onCreate: function (savedInstanceState) {
        trace.write("NativeScriptActivity.onCreate(); savedInstanceState: " + savedInstanceState, trace.categories.NativeLifecycle);
        var frameId = this.getIntent().getExtras().getInt(INTENT_EXTRA);
        for (var i = 0; i < framesCache.length; i++) {
            var aliveFrame = framesCache[i].get();
            if (aliveFrame && aliveFrame.frameId === frameId) {
                this[ANDROID_FRAME] = aliveFrame;
                break;
            }
        }
        if (!this.androidFrame) {
            throw new Error("Could not find AndroidFrame for Activity");
        }
        var isRestart = !!savedInstanceState && activityInitialized;
        this.super.onCreate(isRestart ? savedInstanceState : null);
        this.androidFrame.setActivity(this);
        var root = new org.nativescript.widgets.ContentLayout(this);
        this.androidFrame.rootViewGroup = root;
        this.androidFrame.rootViewGroup.setId(this.frame.containerViewId);
        this.setContentView(this.androidFrame.rootViewGroup, new org.nativescript.widgets.CommonLayoutParams());
        activityInitialized = true;
        this.frame._onActivityCreated(isRestart);
    },
    onActivityResult: function (requestCode, resultCode, data) {
        this.super.onActivityResult(requestCode, resultCode, data);
        trace.write("NativeScriptActivity.onActivityResult();", trace.categories.NativeLifecycle);
        var result = application.android.onActivityResult;
        if (result) {
            result(requestCode, resultCode, data);
        }
        application.android.notify({
            eventName: "activityResult",
            object: application.android,
            activity: this,
            requestCode: requestCode,
            resultCode: resultCode,
            intent: data
        });
    },
    onAttachFragment: function (fragment) {
        trace.write("NativeScriptActivity.onAttachFragment() : " + fragment.getTag(), trace.categories.NativeLifecycle);
        this.super.onAttachFragment(fragment);
        if (!fragment.entry) {
            findPageForFragment(fragment, this.frame);
        }
    },
    onStart: function () {
        this.super.onStart();
        trace.write("NativeScriptActivity.onStart();", trace.categories.NativeLifecycle);
        if (!this.frame.isLoaded) {
            this.frame.onLoaded();
        }
    },
    onStop: function () {
        this.super.onStop();
        trace.write("NativeScriptActivity.onStop();", trace.categories.NativeLifecycle);
        this.frame.onUnloaded();
    },
    onDestroy: function () {
        var frame = this.frame;
        frame._onDetached(true);
        for (var i = 0; i < frame.backStack.length; i++) {
            frame.backStack[i].resolvedPage._onDetached(true);
        }
        this.androidFrame.reset();
        this.super.onDestroy();
        trace.write("NativeScriptActivity.onDestroy();", trace.categories.NativeLifecycle);
    },
    onOptionsItemSelected: function (menuItem) {
        if (!this.androidFrame.hasListeners(frameCommon.Frame.androidOptionSelectedEvent)) {
            return false;
        }
        var data = {
            handled: false,
            eventName: frameCommon.Frame.androidOptionSelectedEvent,
            item: menuItem,
            object: this.androidFrame
        };
        this.androidFrame.notify(data);
        return data.handled;
    },
    onBackPressed: function () {
        trace.write("NativeScriptActivity.onBackPressed;", trace.categories.NativeLifecycle);
        var args = {
            eventName: "activityBackPressed",
            object: application.android,
            activity: this,
            cancel: false,
        };
        application.android.notify(args);
        if (args.cancel) {
            return;
        }
        if (!frameCommon.goBack()) {
            this.super.onBackPressed();
        }
    },
    onLowMemory: function () {
        gc();
        java.lang.System.gc();
        this.super.onLowMemory();
        application.notify({ eventName: application.lowMemoryEvent, object: this, android: this });
    },
    onTrimMemory: function (level) {
        gc();
        java.lang.System.gc();
        this.super.onTrimMemory(level);
    }
};
var framesCounter = 0;
var framesCache = new Array();
var AndroidFrame = (function (_super) {
    __extends(AndroidFrame, _super);
    function AndroidFrame(owner) {
        _super.call(this);
        this.hasOwnActivity = false;
        this._showActionBar = true;
        this._owner = owner;
        this.frameId = framesCounter++;
        framesCache.push(new WeakRef(this));
    }
    Object.defineProperty(AndroidFrame.prototype, "showActionBar", {
        get: function () {
            return this._showActionBar;
        },
        set: function (value) {
            if (this._showActionBar !== value) {
                this._showActionBar = value;
                if (this.owner.currentPage) {
                    this.owner.currentPage.actionBar.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "activity", {
        get: function () {
            if (this._activity) {
                return this._activity;
            }
            var currView = this._owner.parent;
            while (currView) {
                if (currView instanceof Frame) {
                    return currView.android.activity;
                }
                currView = currView.parent;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "actionBar", {
        get: function () {
            var activity = this.currentActivity;
            if (!activity) {
                return undefined;
            }
            var bar = activity.getActionBar();
            if (!bar) {
                return undefined;
            }
            return bar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "currentActivity", {
        get: function () {
            var activity = this.activity;
            if (activity) {
                return activity;
            }
            var stack = frameCommon.stack(), length = stack.length, i = length - 1, frame;
            for (i; i >= 0; i--) {
                frame = stack[i];
                activity = frame.android.activity;
                if (activity) {
                    return activity;
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "owner", {
        get: function () {
            return this._owner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AndroidFrame.prototype, "cachePagesOnNavigate", {
        get: function () {
            return this._cachePagesOnNavigate;
        },
        set: function (value) {
            if (this._cachePagesOnNavigate !== value) {
                if (this._owner.backStack.length > 0) {
                    throw new Error("Cannot set cachePagesOnNavigate if there are items in the back stack.");
                }
                this._cachePagesOnNavigate = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    AndroidFrame.prototype.onActivityRequested = function (intent) {
        if (this.activity) {
            throw new Error("Frame already attached to an Activity");
        }
        intent.putExtra(INTENT_EXTRA, this.frameId);
        this.hasOwnActivity = true;
        return this.createActivity(intent);
    };
    AndroidFrame.prototype.canGoBack = function () {
        if (!this._activity) {
            return false;
        }
        return this._activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
    };
    AndroidFrame.prototype.reset = function () {
        delete this.rootViewGroup[OWNER];
        this._activity = undefined;
        this.rootViewGroup = undefined;
    };
    AndroidFrame.prototype.setActivity = function (value) {
        this._activity = value;
    };
    AndroidFrame.prototype.createActivity = function (intent) {
        return NativeActivity;
    };
    return AndroidFrame;
})(observable.Observable);
function findPageForFragment(fragment, frame) {
    var fragmentTag = fragment.getTag();
    var page;
    var entry;
    trace.write("Attached fragment with no page: " + fragmentTag, trace.categories.NativeLifecycle);
    if (frame.currentPage && frame.currentPage[TAG] === fragmentTag) {
        page = frame.currentPage;
        entry = frame._currentEntry;
        trace.write("Current page matches fragment: " + fragmentTag, trace.categories.NativeLifecycle);
    }
    else {
        var backStack = frame.backStack;
        for (var i = 0; i < backStack.length; i++) {
            entry = backStack[i];
            if (backStack[i].resolvedPage[TAG] === fragmentTag) {
                entry = backStack[i];
                break;
            }
        }
        if (entry) {
            trace.write("Found entry:" + entry + " for fragment: " + fragmentTag, trace.categories.NativeLifecycle);
            page = entry.resolvedPage;
        }
    }
    if (page) {
        fragment.frame = frame;
        fragment.entry = entry;
        page[TAG] = fragmentTag;
    }
    else {
    }
}
function startActivity(activity, entry) {
    var intent = new android.content.Intent(activity, com.tns.NativeScriptActivity.class);
    intent.setAction(android.content.Intent.ACTION_DEFAULT);
    activity.startActivity(intent);
}
