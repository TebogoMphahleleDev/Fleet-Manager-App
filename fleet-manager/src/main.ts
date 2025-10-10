import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAO9OWydv6YWqpcQwgy6bbk3HYwCjoLUfU",
  authDomain: "test-database-7a0e4.firebaseapp.com",
  projectId: "test-database-7a0e4",
  storageBucket: "test-database-7a0e4.firebasestorage.app",
  messagingSenderId: "570547338255",
  appId: "1:570547338255:web:fc0dbe6ffb916aa949377a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
