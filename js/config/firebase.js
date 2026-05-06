const firebaseConfig = {
    apiKey: "AIzaSyCphlXsrhobH6cRH6IccRzX82GRUtglKsc",
    authDomain: "car-reserve-9719a.firebaseapp.com",
    databaseURL: "https://car-reserve-9719a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "car-reserve-9719a",
    storageBucket: "car-reserve-9719a.firebasestorage.app",
    messagingSenderId: "1051488451166",
    appId: "1:1051488451166:web:e6facfa674615529d392cf",
    measurementId: "G-DEYDZKEKHV"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

export const db = firebase.database();
export const auth = firebase.auth();
