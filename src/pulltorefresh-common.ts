import { Color, ContentView, CssProperty, Property, View, Style } from '@nativescript/core';
import { PullToRefresh as PullToRefreshDefinition } from '.';

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

export const indicatorColorProperty = new Property<PullToRefreshBase, Color>(
{
    name: 'indicatorColor',
    affectsLayout: true,
    valueConverter: (v) =>
    {
      if (!Color.isValid(v))
      {
        return null;
      }
      return new Color(v);
    }
});
indicatorColorProperty.register(PullToRefreshBase);

export const indicatorColorStyleProperty = new CssProperty<Style, Color>(
{
    name: 'indicatorColorStyle',
    cssName: 'indicator-color',
    affectsLayout: true,
    valueConverter: (v) =>
    {
      if (!Color.isValid(v))
      {
        return null;
      }
      return new Color(v);
    }
});
indicatorColorStyleProperty.register(Style);

export const indicatorFillColorProperty = new Property<PullToRefreshBase, Color>(
{
    name: 'indicatorFillColor',
    affectsLayout: true,
    valueConverter: (v) =>
    {
      if (!Color.isValid(v))
      {
        return null;
      }
      return new Color(v);
    }
});
indicatorFillColorProperty.register(PullToRefreshBase);

export const indicatorFillColorStyleProperty = new CssProperty<Style, Color>(
{
    name: 'indicatorFillColorStyle',
    cssName: 'indicator-fill-color',
    affectsLayout: true,
    valueConverter: (v) =>
    {
      if (!Color.isValid(v))
      {
        return null;
      }
      return new Color(v);
    }
});
indicatorFillColorStyleProperty.register(Style);