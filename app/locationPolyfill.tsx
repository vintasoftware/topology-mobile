import { Linking } from "react-native";

export default function updateLocationPolyfill(url: string) {
  const locationUrl = new URL(url);

  // Construct a valid origin
  const origin =
    locationUrl.protocol && locationUrl.host
      ? `${locationUrl.protocol}//${locationUrl.host}`
      : locationUrl.href;

  let hrefValue = locationUrl.href; // Store current href

  const locationPolyfill = {
    get href() {
      return hrefValue;
    },
    set href(newUrl: string) {
      hrefValue = newUrl; // Update internal state
      Linking.openURL(newUrl); // Trigger navigation in React Native
    },
    origin,
    protocol: locationUrl.protocol,
    host: locationUrl.host,
    hostname: locationUrl.hostname,
    port: locationUrl.port,
    pathname: locationUrl.pathname,
    search: locationUrl.search,
    hash: locationUrl.hash,
    assign: (newUrl: string) => Linking.openURL(newUrl),
    replace: (newUrl: string) => Linking.openURL(newUrl),
    toString: () => hrefValue,
  };

  Object.defineProperty(window, "location", {
    get: () => locationPolyfill,
    set: (newValue) => {
      if (typeof newValue === "string") {
        locationPolyfill.href = newValue; // Handle direct assignments
      }
    },
    configurable: true,
  });
}
