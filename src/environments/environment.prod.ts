// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { UserRole } from '../app/shared/auth.roles';

export const environment = {

  // for live url ch
  // API_URL: 'http://13.203.141.238:5000',
  // IMAGE_URL: 'http://13.203.141.238:5000/',
  // LANGUAGE_URL: 'http://13.203.141.238:5000/',
  // BASE_URL: 'http://13.203.141.238:5000/',
  // SOCKET_URL: 'http://13.203.141.238:5000/',
  // PAYMENTS_API_URL: 'http://13.203.141.238:5002',
  // HISTORY_API_URL: 'http://13.203.141.238:5001',


    API_URL: 'https://api.womenonwheel.com',
  IMAGE_URL: 'https://api.womenonwheel.com/',
  BASE_URL: 'https://api.womenonwheel.com/',
  SOCKET_URL: 'https://api.womenonwheel.com/',
  LANGUAGE_URL: 'https://api.womenonwheel.com/',
  HISTORY_API_URL: 'https://history.womenonwheel.com',
  PAYMENTS_API_URL: 'https://payment.womenonwheel.com',


  TERMS_URL :'',
  PRIVACY_URL:'',
  
  api_encryption_decryption:false,
  production: true,
  isJivoChat: false,
  isWhatsAppChat: false,
  buyUrl: 'https://1.envato.market/6NV1b',
  SCARF_ANALYTICS: false,
  adminRoot: '/app',
  apiUrl: 'https://api.coloredstrategies.com',
  defaultMenuType: 'menu-default',
  subHiddenBreakpoint: 1440,
  menuHiddenBreakpoint: 768,
  themeColorStorageKey: 'vien-themecolor',
  isMultiColorActive: true,
  defaultColor: 'light.blueyale',
  isDarkSwitchActive: true,
  defaultDirection: 'ltr',
  themeRadiusStorageKey: 'vien-themeradius',
  isAuthGuardActive: true,
  defaultRole: UserRole.Admin,
  STRIPE_KEY: '',
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};
