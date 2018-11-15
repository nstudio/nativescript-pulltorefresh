import * as app from 'tns-core-modules/application';
import * as observableModule from 'tns-core-modules/data/observable';
import * as platformModule from 'tns-core-modules/platform';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { Color } from 'tns-core-modules/color';
import { PullToRefresh } from 'nativescript-pulltorefresh';

const users = [
  { name: 'Billy Bob' },
  { name: 'Tweeder' },
  { name: 'Mox' },
  { name: 'Coach' },
  { name: 'Lance' },
  { name: 'Johnson' },
  { name: 'William' },
  { name: 'Franklin' }
];
const viewModel = observableModule.fromObject({
  users: new ObservableArray(users)
});

export function pageLoaded(args) {
  const page = args.object;
  // Change statusbar color on Lollipop

  if (app.android && platformModule.device.sdkVersion >= '21') {
    const window = app.android.startActivity.getWindow();
    window.setStatusBarColor(new Color('#1976D2').android);
  }
  page.bindingContext = viewModel;
  loadItems();
}

function loadItems() {
  return new Promise(function(resolve, reject) {
    try {
      (20 as any).times(function(i) {
        const item = users[Math.floor(Math.random() * users.length)];
        (viewModel as any).users.unshift(item);
      });
      resolve('great success');
    } catch (ex) {
      reject(ex);
    }
  });
}

export function refreshList(args) {
  const pullRefresh = args.object as PullToRefresh;

  loadItems().then(
    response => {
      console.log(response);
      // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
      setTimeout(() => {
        pullRefresh.refreshing = false;
      }, 1000);
    },
    err => {
      pullRefresh.refreshing = false;
      alert(err);
    }
  );
}

(Number.prototype as any).times = function(func) {
  for (let i = 0; i < Number(this); i++) {
    func(i);
  }
};
