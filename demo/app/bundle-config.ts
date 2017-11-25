declare var global: NodeJS.Global;

if ((<any>global).TNS_WEBPACK) {
  require("tns-core-modules/bundle-entry-points");

  global.registerModule("main-page", () => require("./main-page"));

  // register application modules
  global.registerModule("nativescript-pulltorefresh", () =>
    require("nativescript-pulltorefresh")
  );
}
