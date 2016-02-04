var observable = require("data/observable");
var frame = require("ui/frame");
    
var names = [
    { name: 'Billy Bob' },
    { name: 'Tweeder' },
    { name: 'Mox' },
    { name: 'Coach' },
    { name: 'Lance' },
    { name: 'Johnson'} 
];
var viewModel = new observable.Observable({
    users: names
});

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = viewModel;
}
exports.pageLoaded = pageLoaded;

function swipeLoaded(args) {
    console.log('swipe android: ' + args.object.android);
    console.log('swipe onRefresh ' + args.object.onRefresh);
}
exports.swipeLoaded = swipeLoaded;

function refreshMe(args) {
    console.log('refreshMe() started');
    console.log(args.object);
    setTimeout(function () {
        alert('refresh done');
        args.object.setRefreshing(false);
    }, 1000);
}
exports.refreshMe = refreshMe;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi1wYWdlLnRzIl0sIm5hbWVzIjpbInBhZ2VMb2FkZWQiLCJnb0F3YXkiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFFL0MsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTlDLG9CQUEyQixJQUEwQjtJQUNqREEsSUFBSUEsSUFBSUEsR0FBZUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDbkNBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLFNBQVNBLENBQUNBO0FBQ3BDQSxDQUFDQTtBQUhlLGtCQUFVLGFBR3pCLENBQUE7QUFFRCxnQkFBdUIsSUFBMEI7SUFDN0NDLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLFdBQVdBLENBQUNBO0lBQ3ZDQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtJQUV4Q0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFFbEJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBO1FBQ1RBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBO1FBQ3JCQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNWQSxRQUFRQSxFQUFFQSxJQUFJQTtLQUNqQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBTUEsT0FBQUEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsV0FBV0EsRUFBN0JBLENBQTZCQSxDQUFDQSxDQUFDQTtBQUVqREEsQ0FBQ0E7QUFaZSxjQUFNLFNBWXJCLENBQUEifQ==