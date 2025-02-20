import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { getThemeColor, setThemeColor } from './app/utils/util';

// Create a new link element for the favicon
const faviconLink = document.createElement('link');
faviconLink.rel = 'icon';
faviconLink.type = 'image/x-icon';
faviconLink.id = 'appFavicon';
const randomQueryParam = `random=${Math.random()}`;

// Set the image URL based on the environment
const imageUrl = environment.IMAGE_URL + 'web_images/title_image.png?'+randomQueryParam;

// Function to check if the image exists
function checkImageExists(imageUrl, callback) {
  const img = new Image();
  img.onload = function () {
    callback(true);
  };
  img.onerror = function () {
    callback(false);
  };
  img.src = imageUrl;
}

// Check if the image exists
checkImageExists(imageUrl, (imageExists) => {
  if (imageExists) {
    // If the image exists, set the favicon URL
    faviconLink.href = imageUrl;
  } else {
    // If the image doesn't exist, set the default favicon URL
    const defaultFaviconUrl = 'favicon.ico'; // Path to your default favicon
    faviconLink.href = defaultFaviconUrl;
  }
  // Append the link to the document's head
  document.head.appendChild(faviconLink);
})

if (environment.production) {
  enableProdMode();
}

const color =
  environment.isMultiColorActive || environment.isDarkSwitchActive
    ? getThemeColor()
    : environment.defaultColor;

import('./assets/css/sass/themes/vien.' + color + '.scss')
  .then((x) => {
    setThemeColor(color);
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  })
  .catch(() => {
    setThemeColor(null);
    window.location.reload();
  });
