global.moduleMerge = function (sourceExports, destExports) {
    for (var key in sourceExports) {
        destExports[key] = sourceExports[key];
    }
};
var platform = require("platform");
var consoleModule = require("console");
var c = new consoleModule.Console();
if (platform.device.os === platform.platformNames.android) {
    global.console = c;
}
else if (platform.device.os === platform.platformNames.ios) {
    global.console.dump = function (args) { c.dump(args); };
}
var tm;
function getTimer() {
    if (!tm) {
        tm = require("timer");
    }
    return tm;
}
global.setTimeout = function (callback, milliseconds) {
    return getTimer().setTimeout(callback, milliseconds);
};
global.clearTimeout = function (id) {
    getTimer().clearTimeout(id);
};
global.setInterval = function (callback, milliseconds) {
    return getTimer().setInterval(callback, milliseconds);
};
global.clearInterval = function (id) {
    getTimer().clearInterval(id);
};
var dm;
function getDialogs() {
    if (!dm) {
        dm = require("ui/dialogs");
    }
    return dm;
}
global.alert = function (args) {
    return getDialogs().alert(args);
};
global.confirm = function (args) {
    return getDialogs().confirm(args);
};
global.prompt = function (args) {
    return getDialogs().prompt(args);
};
var xhr = require("../xhr/xhr");
global.moduleMerge(xhr, global);
var fetchModule = require("fetch");
global.moduleMerge(fetchModule, global);
if (typeof global.__decorate !== "function") {
    global.__decorate = function (decorators, target, key, desc) {
        if (typeof global.Reflect === "object" && typeof global.Reflect.decorate === "function") {
            return global.Reflect.decorate(decorators, target, key, desc);
        }
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    };
}
function Deprecated(target, key, descriptor) {
    if (descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log(key + " is deprecated");
            return originalMethod.apply(this, args);
        };
        return descriptor;
    }
    else {
        console.log((target && target.name || target) + " is deprecated");
        return target;
    }
}
exports.Deprecated = Deprecated;
global.Deprecated = Deprecated;
