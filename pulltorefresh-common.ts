import { PullToRefresh as PullToRefreshDefinition } from ".";
import { ContentView } from "tns-core-modules/ui/content-view";
import { Property, View } from "tns-core-modules/ui/core/view";

export * from "tns-core-modules/ui/content-view";

export class PullToRefreshBase extends ContentView
  implements PullToRefreshDefinition {
  public static refreshEvent = "refresh";

  public refreshing: boolean;

  public _addChildFromBuilder(name: string, value: any) {
    // copy inheirtable style property values
    var originalColor = value.style.color || null;

    if (value instanceof View) {
      this.content = value;
    }

    // reset inheritable style property values as we do not want those to be inherited
    value.style.color = originalColor;
  }
}

export const refreshingProperty = new Property<PullToRefreshBase, boolean>({
  name: "refreshing",
  defaultValue: false
});
refreshingProperty.register(PullToRefreshBase);
