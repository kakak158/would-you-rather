// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgjWpfJP46A2PaCVQz_OPHKeryg2VrSlw",
  authDomain: "my-wyr-project.firebaseapp.com",
  projectId: "my-wyr-project",
  storageBucket: "my-wyr-project.firebasestorage.app",
  messagingSenderId: "574420841825",
  appId: "1:574420841825:web:b60895a0bdd7ce3e200120",
  measurementId: "G-DSMY2KQVFY",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();
