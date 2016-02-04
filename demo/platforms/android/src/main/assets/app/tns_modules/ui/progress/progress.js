var common = require("./progress-common");
var R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;
function onValuePropertyChanged(data) {
    var progress = data.object;
    if (!progress.android) {
        return;
    }
    progress.android.setProgress(data.newValue);
}
function onMaxValuePropertyChanged(data) {
    var progress = data.object;
    if (!progress.android) {
        return;
    }
    progress.android.setMax(data.newValue);
}
common.Progress.valueProperty.metadata.onSetNativeValue = onValuePropertyChanged;
common.Progress.maxValueProperty.metadata.onSetNativeValue = onMaxValuePropertyChanged;
global.moduleMerge(common, exports);
var Progress = (function (_super) {
    __extends(Progress, _super);
    function Progress() {
        _super.apply(this, arguments);
    }
    Progress.prototype._createUI = function () {
        this._android = new android.widget.ProgressBar(this._context, null, R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL);
    };
    Object.defineProperty(Progress.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    return Progress;
})(common.Progress);
exports.Progress = Progress;
