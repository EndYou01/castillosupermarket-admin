import { INavigationItems, INavigationRoute } from "../interfaces/interfaces";
import { NavigationRoutes } from "../static/NavigationRoutes";

export function findRouteByUrl(url: string): INavigationRoute | undefined {
    const searchItems = (items: INavigationItems[]): boolean =>
      items.some(
        (item) => item.url === url || (item.items && searchItems(item.items))
      );
  
    return NavigationRoutes.find(
      (route) => route.url === url || searchItems(route.items)
    );
  }
  
  export function findSettingsItemByUrl(
    settingsRoute: INavigationRoute,
    url: string
  ): INavigationItems | undefined {
    const search = (items: INavigationItems[]): INavigationItems | undefined => {
      for (const item of items) {
        if (item.url === url) return item;
        if (item.items) {
          const found = search(item.items);
          if (found) return found;
        }
      }
      return undefined;
    };
  
    return search(settingsRoute.items || []);
  }
  
  export function getUrlHierarchy(url: string): string[] {
    const parts = url.split("/").filter(Boolean);
    return parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"));
  }