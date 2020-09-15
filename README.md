<a align="center" href="https://www.npmjs.com/package/@nstudio/nativescript-pulltorefresh">
    <h2 align="center">NativeScript-PullToRefresh</h2>
</a>
<h4 align="center">
NativeScript plugin to use Pull to Refresh on any view.
</h4>

<p align="center">
    <a href="https://www.npmjs.com/package/@nstudio/nativescript-pulltorefresh">
        <img src="https://img.shields.io/npm/v/@nstudio/nativescript-pulltorefresh.svg" alt="npm">
    </a>
    <a href="https://www.npmjs.com/package/@nstudio/nativescript-pulltorefresh">
        <img src="https://img.shields.io/npm/dt/@nstudio/nativescript-pulltorefresh.svg?label=npm%20downloads" alt="npm">
    </a>
</p>

---

## Installation

#### NativeScript 7+:

```bash
ns plugin add @nstudio/nativescript-pulltorefresh
```

#### NativeScript prior to 7:

```bash
tns plugin add @nstudio/nativescript-pulltorefresh@2.1.0
```

#### [Android - _SwipeRefreshLayout_](http://developer.android.com/reference/android/support/v4/widget/SwipeRefreshLayout.html)

#### [iOS - _UIRefreshControl_](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIRefreshControl_class/)

### Sample Screen

| Android                                        | iOS                                    |
| ---------------------------------------------- | -------------------------------------- |
| ![Android Sample](screens/android_refresh.gif) | ![iOS Sample](screens/ios_refresh.gif) |

## Usage

### NativeScript Core

#### XML

```xml
<page xmlns="http://schemas.nativescript.org/tns.xsd"
      xmlns:PullRefresh="@nstudio/nativescript-pulltorefresh"
      loaded="pageLoaded">
    <PullRefresh:PullToRefresh refresh="refreshList" indicatorFillColor="#fff000" indicatorColor="#3489db">
        <list-view items="{{ users }}">
            <list-view.itemTemplate>
                <label text="{{ name }}" row="0" col="1"textWrap="true" class="message" />
            </list-view.itemTemplate>
        </list-view>
    </PullRefresh:PullToRefresh>
</page>
```

#### JS

```javascript
function refreshList(args) {
  // Get reference to the PullToRefresh component;
  var pullRefresh = args.object;

  // Do work here... and when done call set refreshing property to false to stop the refreshing
  loadItems().then(
    (resp) => {
      // ONLY USING A TIMEOUT TO SIMULATE/SHOW OFF THE REFRESHING
      setTimeout(() => {
        pullRefresh.refreshing = false;
      }, 1000);
    },
    (err) => {
      pullRefresh.refreshing = false;
    }
  );
}
exports.refreshList = refreshList;
```

### Angular NativeScript

```typescript
import { registerElement } from "nativescript-angular/element-registry";
registerElement("PullToRefresh", () => require("@nstudio/nativescript-pulltorefresh").PullToRefresh);

refreshList(args) {
         const pullRefresh = args.object;
         setTimeout(function () {
            pullRefresh.refreshing = false;
         }, 1000);
    }
```

#### HTML

```html
<PullToRefresh
  (refresh)="refreshList($event)"
  indicatorFillColor="#fff000"
  indicatorColor="#3489db"
>
  <ListView [items]="itemList">
    <template let-item="item">
      <label [text]="item.id"></label>
    </template>
  </ListView>
</PullToRefresh>
```

### NativeScript Vue

```javascript
import Vue from 'nativescript-vue';

Vue.registerElement(
  'PullToRefresh',
  () => require('@nstudio/nativescript-pulltorefresh').PullToRefresh
);
```

#### Component

```vue
<template>
  <Page>
    <PullToRefresh
      @refresh="refreshList"
      indicatorFillColor="#fff000"
      indicatorColor="#3489db"
    >
      <ListView for="item in listOfItems" @itemTap="onItemTap">
        <v-template>
          <!-- Shows the list item label in the default color and style. -->
          <label :text="item.text" />
        </v-template>
      </ListView>
    </PullToRefresh>
  </Page>
</template>

<script>
export default {
  methods: {
    refreshList(args) {
      var pullRefresh = args.object;
      setTimeout(function () {
        pullRefresh.refreshing = false;
      }, 1000);
    },
  },
};
</script>
```

## Properties

- **refresh : function** _required_
- **refreshing: boolean** - Notifies the widget that the refresh state has
  changed.
- **indicatorFillColor: Color** - the color of the indicator background fill.
- **indicatorColor: Color** - the color of the indicator itself.

## [Changelog](./CHANGELOG.md)

## [Contributing](./CONTRIBUTING.md)
