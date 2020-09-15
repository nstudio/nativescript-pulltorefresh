import {
  Application,
  Color,
  Device,
  Dialogs,
  fromObject,
  isAndroid,
  ObservableArray,
  Utils,
} from '@nativescript/core';
import { PullToRefresh } from '@nstudio/nativescript-pulltorefresh';

const users = [
  { name: 'Billy Bob' },
  { name: 'Tweeder' },
  { name: 'Mox' },
  { name: 'Coach' },
  { name: 'Lance' },
  { name: 'Johnson' },
  { name: 'William' },
  { name: 'Franklin' },
];
const viewModel = fromObject({
  users: new ObservableArray(users),
});

export function pageLoaded(args) {
  const page = args.object;
  // Change statusbar color on Lollipop

  if (isAndroid && Device.sdkVersion >= '21') {
    const window = Application.android.startActivity.getWindow();
    window.setStatusBarColor(new Color('#2e2e2e').android);
  }
  page.bindingContext = viewModel;
  loadItems();
}

export function nStudioIconTap() {
  Dialogs.confirm({
    message:
      'nStudio, LLC. specializes in custom software applications ranging from mobile, web, desktop, server and more. Would you like to visit nstudio.io?',
    okButtonText: 'Yes',
    cancelButtonText: 'Close',
  }).then((result) => {
    if (result) {
      Utils.openUrl('https://nstudio.io');
    }
  });
}

function loadItems() {
  return new Promise((resolve, reject) => {
    try {
      (20 as any).times((i) => {
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
    (response) => {
      console.log(response);
      // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
      setTimeout(() => {
        pullRefresh.refreshing = false;
      }, 1200);
    },
    (err) => {
      pullRefresh.refreshing = false;
      alert(err);
    }
  );
}

(Number.prototype as any).times = (func) => {
  for (let i = 0; i < Number(this); i++) {
    func(i);
  }
};
