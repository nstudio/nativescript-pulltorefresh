var common = require("./web-view-common");
var trace = require("trace");
var fs = require("file-system");
global.moduleMerge(common, exports);
var WebViewClientClass = (function (_super) {
    __extends(WebViewClientClass, _super);
    function WebViewClientClass(view) {
        _super.call(this);
        this._view = view;
        return global.__native(this);
    }
    WebViewClientClass.prototype.shouldOverrideUrlLoading = function (view, url) {
        trace.write("WebViewClientClass.shouldOverrideUrlLoading(" + url + ")", trace.categories.Debug);
        return false;
    };
    WebViewClientClass.prototype.onPageStarted = function (view, url, favicon) {
        _super.prototype.onPageStarted.call(this, view, url, favicon);
        if (this._view) {
            trace.write("WebViewClientClass.onPageStarted(" + url + ", " + favicon + ")", trace.categories.Debug);
            this._view._onLoadStarted(url);
        }
    };
    WebViewClientClass.prototype.onPageFinished = function (view, url) {
        _super.prototype.onPageFinished.call(this, view, url);
        if (this._view) {
            trace.write("WebViewClientClass.onPageFinished(" + url + ")", trace.categories.Debug);
            this._view._onLoadFinished(url, undefined);
        }
    };
    WebViewClientClass.prototype.onReceivedError = function () {
        var view = arguments[0];
        if (arguments.length === 4) {
            var errorCode = arguments[1];
            var description = arguments[2];
            var failingUrl = arguments[3];
            _super.prototype.onReceivedError.call(this, view, errorCode, description, failingUrl);
            if (this._view) {
                trace.write("WebViewClientClass.onReceivedError(" + errorCode + ", " + description + ", " + failingUrl + ")", trace.categories.Debug);
                this._view._onLoadFinished(failingUrl, description + "(" + errorCode + ")");
            }
        }
        else {
            var request = arguments[1];
            var error = arguments[2];
            _super.prototype.onReceivedError.call(this, view, request, error);
            if (this._view) {
                trace.write("WebViewClientClass.onReceivedError(" + error.getErrorCode() + ", " + error.getDescription() + ", " + (error.getUrl && error.getUrl()) + ")", trace.categories.Debug);
                this._view._onLoadFinished(error.getUrl && error.getUrl(), error.getDescription() + "(" + error.getErrorCode() + ")");
            }
        }
    };
    return WebViewClientClass;
})(android.webkit.WebViewClient);
exports.WebViewClientClass = WebViewClientClass;
;
var WebView = (function (_super) {
    __extends(WebView, _super);
    function WebView() {
        _super.call(this);
        this._webViewClient = new WebViewClientClass(this);
    }
    Object.defineProperty(WebView.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    WebView.prototype._createUI = function () {
        this._android = new android.webkit.WebView(this._context);
        this._android.getSettings().setJavaScriptEnabled(true);
        this._android.getSettings().setBuiltInZoomControls(true);
        this._android.setWebViewClient(this._webViewClient);
    };
    WebView.prototype._loadUrl = function (url) {
        if (!this._android) {
            return;
        }
        trace.write("WebView._loadUrl(" + url + ")", trace.categories.Debug);
        this._android.stopLoading();
        this._android.loadUrl(url);
    };
    WebView.prototype._loadFileOrResource = function (path, content) {
        if (!this._android) {
            return;
        }
        var baseUrl = "file:///" + path.substring(0, path.lastIndexOf('/') + 1);
        this._android.loadDataWithBaseURL(baseUrl, content, "text/html", "utf-8", null);
    };
    WebView.prototype._loadHttp = function (src) {
        if (!this._android) {
            return;
        }
        this._android.loadUrl(src);
    };
    WebView.prototype._loadData = function (src) {
        if (!this._android) {
            return;
        }
        var baseUrl = "file:///" + fs.knownFolders.currentApp().path + "/";
        this._android.loadDataWithBaseURL(baseUrl, src, "text/html", "utf-8", null);
    };
    Object.defineProperty(WebView.prototype, "canGoBack", {
        get: function () {
            return this._android.canGoBack();
        },
        enumerable: true,
        configurable: true
    });
    WebView.prototype.stopLoading = function () {
        if (this._android) {
            this._android.stopLoading();
        }
    };
    Object.defineProperty(WebView.prototype, "canGoForward", {
        get: function () {
            return this._android.canGoForward();
        },
        enumerable: true,
        configurable: true
    });
    WebView.prototype.goBack = function () {
        this._android.goBack();
    };
    WebView.prototype.goForward = function () {
        this._android.goForward();
    };
    WebView.prototype.reload = function () {
        this._android.reload();
    };
    return WebView;
})(common.WebView);
exports.WebView = WebView;
