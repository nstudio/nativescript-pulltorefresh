var httpRequest = require("http/http-request");
global.moduleMerge(httpRequest, exports);
function getString(arg) {
    return new Promise(function (resolve, reject) {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(function (r) {
            try {
                var str = r.content.toString();
                resolve(str);
            }
            catch (e) {
                reject(e);
            }
        }, function (e) { return reject(e); });
    });
}
exports.getString = getString;
function getJSON(arg) {
    return new Promise(function (resolve, reject) {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(function (r) {
            try {
                var json = r.content.toJSON();
                resolve(json);
            }
            catch (e) {
                reject(e);
            }
        }, function (e) { return reject(e); });
    });
}
exports.getJSON = getJSON;
function getImage(arg) {
    return new Promise(function (resolve, reject) {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(function (r) {
            r.content.toImage().then(function (source) { return resolve(source); }, function (e) { return reject(e); });
        }, function (e) { return reject(e); });
    });
}
exports.getImage = getImage;
