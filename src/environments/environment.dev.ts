// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { UserRole } from '../app/shared/auth.roles';

export const environment = {

  // for developer
  API_URL: '',
  IMAGE_URL: '',
  LANGUAGE_URL: '',
  BASE_URL: '',
  SOCKET_URL: '',
  DRIVER_WEB : '',
  PAYMENTS_API_URL: '',
  HISTORY_API_URL: '',

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
