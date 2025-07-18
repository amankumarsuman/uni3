importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
// // Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
	// apiKey: "",
	// authDomain: "",
	// projectId: "",
	// storageBucket: "",
	// messagingSenderId: "",
	// appId: "",
	// measurementId: "",
	apiKey: "AIzaSyAVFd8_6NSn5UTrxlc54iXDSDbNIvAC3vE",
  authDomain: "naturalganic.firebaseapp.com",
  projectId: "naturalganic",
  storageBucket: "naturalganic.appspot.com",
  messagingSenderId: "414638876211",
  appId: "1:414638876211:web:b156e1289a297138c3a546",
  measurementId: "G-8PT7CDXR0L"
};


firebase?.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase?.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
