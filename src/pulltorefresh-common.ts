import { ContentView } from 'tns-core-modules/ui/content-view';
import { Property, View } from 'tns-core-modules/ui/core/view';
import { PullToRefresh as PullToRefreshDefinition } from '.';

export * from 'tns-core-modules/ui/content-view';

export class PullToRefreshBase extends ContentView
  implements PullToRefreshDefinition {
  public static refreshEvent = 'refresh';

  public refreshing: boolean;
}

export const refreshingProperty = new Property<PullToRefreshBase, boolean>({
  name: 'refreshing',
  defaultValue: false
});
refreshingProperty.register(PullToRefreshBase);
