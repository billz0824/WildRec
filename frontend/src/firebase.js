import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCT6gkL5vuAJvO2EJcOWooxkxbsgmhihSI",
  authDomain: "wildrec-241f1.firebaseapp.com",
  projectId: "wildrec-241f1",
  storageBucket: "wildrec-241f1.appspot.com",
  messagingSenderId: "561044526800",
  appId: "1:561044526800:web:4088e5f81141aa8bfb70d5",
  measurementId: "G-48MFRJK5B3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
