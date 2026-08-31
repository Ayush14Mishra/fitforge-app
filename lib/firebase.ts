import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCRE7AR8jjzP1xTrMgF_W4dyQy0cIcAphY',
  authDomain: 'fitforge-coach-app-arya.firebaseapp.com',
  projectId: 'fitforge-coach-app-arya',
  storageBucket: 'fitforge-coach-app-arya.firebasestorage.app',
  messagingSenderId: '9939666227',
  appId: '1:9939666227:web:a181afb647fce10d43ea46',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
