// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { UserRole } from '../app/shared/auth.roles';

export const environment = {
  API_URL: 'https://api.womenonwheel.com',
  IMAGE_URL: 'https://api.womenonwheel.com/',
  BASE_URL: 'https://api.womenonwheel.com/',
  SOCKET_URL: 'https://api.womenonwheel.com/',
  LANGUAGE_URL: 'https://api.womenonwheel.com/',
  HISTORY_API_URL: 'https://history.womenonwheel.com',
  PAYMENTS_API_URL: 'https://payment.womenonwheel.com',
  WEBSITE_URL: 'https://user.womenonwheel.com/',
  // API_URL: '',
  // IMAGE_URL: '',
  // LANGUAGE_URL: '',
  // BASE_URL: '',
  // SOCKET_URL: '',
  // PAYMENTS_API_URL: '',
  // HISTORY_API_URL: '',

  TERMS_URL :'',
  PRIVACY_URL:'',
  DRIVER_WEB : '',

  api_encryption_decryption:false,
  production: false,
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
    // apiKey: "",
    // authDomain: "",
    // databaseURL: "",
    // projectId: "",
    // storageBucket: "",
    // messagingSenderId: "",
    // appId: "",
    // measurementId: ""

  apiKey: "AIzaSyCukJ1rqzX6dJLO2d5NuJBX8MEIb2VEgOE",
  authDomain: "womenonwheels-98795.firebaseapp.com",
  databaseURL: "https://womenonwheels-98795-default-rtdb.firebaseio.com",
  projectId: "womenonwheels-98795",
  storageBucket: "womenonwheels-98795.firebasestorage.app",
  messagingSenderId: "462615774647",
  appId: "1:462615774647:web:a24d699a2d6c1458f3d432",
  measurementId: "G-MXL572M83X"
  }
};

