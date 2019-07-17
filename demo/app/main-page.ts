import { PullToRefresh } from '@nstudio/nativescript-pulltorefresh';
import * as app from 'tns-core-modules/application';
import { Color } from 'tns-core-modules/color';
import { fromObject } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { device } from 'tns-core-modules/platform';
import { confirm } from 'tns-core-modules/ui/dialogs';
import { openUrl } from 'tns-core-modules/utils/utils';

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
const viewModel = fromObject({
  users: new ObservableArray(users)
});

export function pageLoaded(args) {
  const page = args.object;
  // Change statusbar color on Lollipop

  if (app.android && device.sdkVersion >= '21') {
    const window = app.android.startActivity.getWindow();
    window.setStatusBarColor(new Color('#2e2e2e').android);
  }
  page.bindingContext = viewModel;
  loadItems();
}

export function nStudioIconTap() {
  confirm({
    message:
      'nStudio, LLC. specializes in custom software applications ranging from mobile, web, desktop, server and more. Would you like to visit nstudio.io?',
    okButtonText: 'Yes',
    cancelButtonText: 'Close'
  }).then(result => {
    if (result) {
      openUrl('https://nstudio.io');
    }
  });
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
      }, 1200);
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
