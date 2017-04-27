import { PullToRefresh as PullToRefreshDefinition } from ".";
import { ContentView } from "ui/content-view";
import { Property, View } from "ui/core/view";

export * from "ui/content-view";

export class PullToRefreshBase extends ContentView implements PullToRefreshDefinition {
    public static refreshEvent = "refresh";
    
    public refreshing: boolean;

    public _addChildFromBuilder(name: string, value: any) {
        // Copy inheirtable style property values
        var originalColor = value.style.color || null;
        
        if (value instanceof View) {
            this.content = value;
        }
        
        // Reset inheritable style property values as we do not want those to be inherited
        value.style.color = originalColor;
    }
}

export const refreshingProperty = new Property<PullToRefreshBase, boolean>({
    name: "refreshing",
    defaultValue: false
});
refreshingProperty.register(PullToRefreshBase);