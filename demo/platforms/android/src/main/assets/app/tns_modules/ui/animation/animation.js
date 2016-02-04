var common = require("./animation-common");
var utils = require("utils/utils");
var color = require("color");
var trace = require("trace");
var types = require("utils/types");
var enums = require("ui/enums");
global.moduleMerge(common, exports);
var floatType = java.lang.Float.class.getField("TYPE").get(null);
var argbEvaluator = new android.animation.ArgbEvaluator();
var keyPrefix = "ui.animation.";
var propertyKeys = {};
propertyKeys[common.Properties.backgroundColor] = Symbol(keyPrefix + common.Properties.backgroundColor);
propertyKeys[common.Properties.opacity] = Symbol(keyPrefix + common.Properties.opacity);
propertyKeys[common.Properties.rotate] = Symbol(keyPrefix + common.Properties.rotate);
propertyKeys[common.Properties.scale] = Symbol(keyPrefix + common.Properties.scale);
propertyKeys[common.Properties.translate] = Symbol(keyPrefix + common.Properties.translate);
var Animation = (function (_super) {
    __extends(Animation, _super);
    function Animation(animationDefinitions, playSequentially) {
        _super.call(this, animationDefinitions, playSequentially);
        var that = this;
        this._animatorListener = new android.animation.Animator.AnimatorListener({
            onAnimationStart: function (animator) {
                trace.write("MainAnimatorListener.onAndroidAnimationStart(" + animator + ")", trace.categories.Animation);
            },
            onAnimationRepeat: function (animator) {
                trace.write("MainAnimatorListener.onAnimationRepeat(" + animator + ")", trace.categories.Animation);
            },
            onAnimationEnd: function (animator) {
                trace.write("MainAnimatorListener.onAnimationEnd(" + animator + ")", trace.categories.Animation);
                that._onAndroidAnimationEnd();
            },
            onAnimationCancel: function (animator) {
                trace.write("MainAnimatorListener.onAnimationCancel(" + animator + ")", trace.categories.Animation);
                that._onAndroidAnimationCancel();
            }
        });
    }
    Animation.prototype.play = function () {
        var animationFinishedPromise = _super.prototype.play.call(this);
        var i;
        var length;
        this._animators = new Array();
        this._propertyUpdateCallbacks = new Array();
        this._propertyResetCallbacks = new Array();
        i = 0;
        length = this._propertyAnimations.length;
        for (; i < length; i++) {
            this._createAnimators(this._propertyAnimations[i]);
        }
        this._nativeAnimatorsArray = java.lang.reflect.Array.newInstance(android.animation.Animator.class, this._animators.length);
        i = 0;
        length = this._animators.length;
        for (; i < length; i++) {
            this._nativeAnimatorsArray[i] = this._animators[i];
        }
        this._animatorSet = new android.animation.AnimatorSet();
        this._animatorSet.addListener(this._animatorListener);
        if (this._playSequentially) {
            this._animatorSet.playSequentially(this._nativeAnimatorsArray);
        }
        else {
            this._animatorSet.playTogether(this._nativeAnimatorsArray);
        }
        trace.write("Starting " + this._nativeAnimatorsArray.length + " animations " + (this._playSequentially ? "sequentially." : "together."), trace.categories.Animation);
        this._animatorSet.setupStartValues();
        this._animatorSet.start();
        return animationFinishedPromise;
    };
    Animation.prototype.cancel = function () {
        _super.prototype.cancel.call(this);
        trace.write("Cancelling AnimatorSet.", trace.categories.Animation);
        this._animatorSet.cancel();
    };
    Animation.prototype._onAndroidAnimationEnd = function () {
        if (!this.isPlaying) {
            return;
        }
        var i = 0;
        var length = this._propertyUpdateCallbacks.length;
        for (; i < length; i++) {
            this._propertyUpdateCallbacks[i]();
        }
        this._resolveAnimationFinishedPromise();
    };
    Animation.prototype._onAndroidAnimationCancel = function () {
        var i = 0;
        var length = this._propertyResetCallbacks.length;
        for (; i < length; i++) {
            this._propertyResetCallbacks[i]();
        }
        this._rejectAnimationFinishedPromise();
    };
    Animation.prototype._createAnimators = function (propertyAnimation) {
        trace.write("Creating ObjectAnimator(s) for animation: " + common.Animation._getAnimationInfo(propertyAnimation) + "...", trace.categories.Animation);
        if (types.isNullOrUndefined(propertyAnimation.target)) {
            throw new Error("Animation target cannot be null or undefined!");
        }
        if (types.isNullOrUndefined(propertyAnimation.property)) {
            throw new Error("Animation property cannot be null or undefined!");
        }
        if (types.isNullOrUndefined(propertyAnimation.value)) {
            throw new Error("Animation value cannot be null or undefined!");
        }
        var nativeArray;
        var nativeView = propertyAnimation.target._nativeView;
        var animators = new Array();
        var propertyUpdateCallbacks = new Array();
        var propertyResetCallbacks = new Array();
        var originalValue1;
        var originalValue2;
        var density = utils.layout.getDisplayDensity();
        var xyObjectAnimators;
        var animatorSet;
        var key = propertyKeys[propertyAnimation.property];
        if (key) {
            propertyAnimation.target[key] = propertyAnimation;
        }
        function checkAnimation(cb) {
            return function () {
                if (propertyAnimation.target[key] === propertyAnimation) {
                    delete propertyAnimation.target[key];
                    cb();
                }
            };
        }
        switch (propertyAnimation.property) {
            case common.Properties.opacity:
                originalValue1 = nativeView.getAlpha();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(function () { propertyAnimation.target.opacity = propertyAnimation.value; }));
                propertyResetCallbacks.push(checkAnimation(function () { nativeView.setAlpha(originalValue1); }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "alpha", nativeArray));
                break;
            case common.Properties.backgroundColor:
                originalValue1 = nativeView.getBackground();
                nativeArray = java.lang.reflect.Array.newInstance(java.lang.Object.class, 2);
                nativeArray[0] = propertyAnimation.target.backgroundColor ? java.lang.Integer.valueOf(propertyAnimation.target.backgroundColor.argb) : java.lang.Integer.valueOf(-1);
                nativeArray[1] = java.lang.Integer.valueOf(propertyAnimation.value.argb);
                var animator = android.animation.ValueAnimator.ofObject(argbEvaluator, nativeArray);
                animator.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
                    onAnimationUpdate: function (animator) {
                        var argb = animator.getAnimatedValue().intValue();
                        propertyAnimation.target.backgroundColor = new color.Color(argb);
                    }
                }));
                propertyUpdateCallbacks.push(checkAnimation(function () { propertyAnimation.target.backgroundColor = propertyAnimation.value; }));
                propertyResetCallbacks.push(checkAnimation(function () { nativeView.setBackground(originalValue1); }));
                animators.push(animator);
                break;
            case common.Properties.translate:
                xyObjectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x * density;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y * density;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "translationY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                originalValue1 = nativeView.getTranslationX();
                originalValue2 = nativeView.getTranslationY();
                propertyUpdateCallbacks.push(checkAnimation(function () {
                    propertyAnimation.target.translateX = propertyAnimation.value.x;
                    propertyAnimation.target.translateY = propertyAnimation.value.y;
                }));
                propertyResetCallbacks.push(checkAnimation(function () {
                    nativeView.setTranslationX(originalValue1);
                    nativeView.setTranslationY(originalValue2);
                }));
                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;
            case common.Properties.scale:
                xyObjectAnimators = java.lang.reflect.Array.newInstance(android.animation.Animator.class, 2);
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.x;
                xyObjectAnimators[0] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleX", nativeArray);
                xyObjectAnimators[0].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value.y;
                xyObjectAnimators[1] = android.animation.ObjectAnimator.ofFloat(nativeView, "scaleY", nativeArray);
                xyObjectAnimators[1].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
                originalValue1 = nativeView.getScaleX();
                originalValue2 = nativeView.getScaleY();
                propertyUpdateCallbacks.push(checkAnimation(function () {
                    propertyAnimation.target.scaleX = propertyAnimation.value.x;
                    propertyAnimation.target.scaleY = propertyAnimation.value.y;
                }));
                propertyResetCallbacks.push(checkAnimation(function () {
                    nativeView.setScaleY(originalValue1);
                    nativeView.setScaleY(originalValue2);
                }));
                animatorSet = new android.animation.AnimatorSet();
                animatorSet.playTogether(xyObjectAnimators);
                animatorSet.setupStartValues();
                animators.push(animatorSet);
                break;
            case common.Properties.rotate:
                originalValue1 = nativeView.getRotation();
                nativeArray = java.lang.reflect.Array.newInstance(floatType, 1);
                nativeArray[0] = propertyAnimation.value;
                propertyUpdateCallbacks.push(checkAnimation(function () { propertyAnimation.target.rotate = propertyAnimation.value; }));
                propertyResetCallbacks.push(checkAnimation(function () { nativeView.setRotation(originalValue1); }));
                animators.push(android.animation.ObjectAnimator.ofFloat(nativeView, "rotation", nativeArray));
                break;
            default:
                throw new Error("Cannot animate " + propertyAnimation.property);
                break;
        }
        var i = 0;
        var length = animators.length;
        for (; i < length; i++) {
            if (propertyAnimation.duration !== undefined) {
                animators[i].setDuration(propertyAnimation.duration);
            }
            if (propertyAnimation.delay !== undefined) {
                animators[i].setStartDelay(propertyAnimation.delay);
            }
            if (propertyAnimation.iterations !== undefined && animators[i] instanceof android.animation.ValueAnimator) {
                animators[i].setRepeatCount(Animation._getAndroidRepeatCount(propertyAnimation.iterations));
            }
            if (propertyAnimation.curve !== undefined) {
                animators[i].setInterpolator(propertyAnimation.curve);
            }
            trace.write("Animator created: " + animators[i], trace.categories.Animation);
        }
        this._animators = this._animators.concat(animators);
        this._propertyUpdateCallbacks = this._propertyUpdateCallbacks.concat(propertyUpdateCallbacks);
        this._propertyResetCallbacks = this._propertyResetCallbacks.concat(propertyResetCallbacks);
    };
    Animation.prototype._resolveAnimationCurve = function (curve) {
        switch (curve) {
            case enums.AnimationCurve.easeIn:
                trace.write("Animation curve resolved to android.view.animation.AccelerateInterpolator(1).", trace.categories.Animation);
                return new android.view.animation.AccelerateInterpolator(1);
            case enums.AnimationCurve.easeOut:
                trace.write("Animation curve resolved to android.view.animation.DecelerateInterpolator(1).", trace.categories.Animation);
                return new android.view.animation.DecelerateInterpolator(1);
            case enums.AnimationCurve.easeInOut:
                trace.write("Animation curve resolved to android.view.animation.AccelerateDecelerateInterpolator().", trace.categories.Animation);
                return new android.view.animation.AccelerateDecelerateInterpolator();
            case enums.AnimationCurve.linear:
                trace.write("Animation curve resolved to android.view.animation.LinearInterpolator().", trace.categories.Animation);
                return new android.view.animation.LinearInterpolator();
            default:
                trace.write("Animation curve resolved to original: " + curve, trace.categories.Animation);
                return curve;
        }
    };
    Animation._getAndroidRepeatCount = function (iterations) {
        return (iterations === Number.POSITIVE_INFINITY) ? android.view.animation.Animation.INFINITE : iterations - 1;
    };
    return Animation;
})(common.Animation);
exports.Animation = Animation;
