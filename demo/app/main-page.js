var app = require("application");
var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var platformModule = require("platform");
var color = require("color");

var users = [
    { name: 'Billy Bob' },
    { name: 'Tweeder' },
    { name: 'Mox' },
    { name: 'Coach' }, 
    { name: 'Lance' },
    { name: 'Johnson' },
    { name: 'William' },
    { name: 'Franklin' }
];
var viewModel = new Observable({
    users: new ObservableArray(users)
});

function pageLoaded(args) {
    var page = args.object;
    // Change statusbar color on Lollipop

    if (app.android && platformModule.device.sdkVersion >= "21") {
        var window = app.android.startActivity.getWindow();
        window.setStatusBarColor(new color.Color("#1976D2").android);
    }
    page.bindingContext = viewModel; 
    loadItems();
}
exports.pageLoaded = pageLoaded;

function loadItems() {
    return new Promise(function (resolve, reject) {
        try { 
            (20).times(function (i) {
                var item = users[Math.floor(Math.random() * users.length)];
                viewModel.users.unshift(item);
            });
            resolve("great success");

        } catch (ex) {
            reject(ex);
        }
    });
}

function refreshList(args) {

    var pullRefresh = args.object;

    loadItems().then(function (response) {
        console.log(response);
        // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
        setTimeout(function () {
            pullRefresh.setRefreshing(false);
        }, 1000);
    }, function (err) {
        pullRefresh.setRefreshing(false);
        alert(err);
    });
}
exports.refreshList = refreshList;



Number.prototype.times = function (func) {
    for (var i = 0; i < Number(this) ; i++) {
        func(i);
    }
}