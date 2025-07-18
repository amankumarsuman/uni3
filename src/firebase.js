import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { getAuth } from "firebase/auth";
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

const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();
const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(firebaseApp);
    }
    return null;
  } catch (err) {
    return null;
  }
})();

export const fetchToken = async (setTokenFound, setFcmToken) => {
  return getToken(await messaging, {
    vapidKey:
      "",
  })
    .then((currentToken) => {
      if (currentToken) {
        setTokenFound(true);
        setFcmToken(currentToken);

        // Track the token -> client mapping, by sending to backend server
        // show on the UI that permission is secured
      } else {
        setTokenFound(false);
        setFcmToken();
        // shows on the UI that permission is required
      }
    })
    .catch((err) => {
      console.error(err);
      // catch error while creating client token
    });
};

export const onMessageListener = async () =>
  new Promise((resolve) =>
    (async () => {
      const messagingResolve = await messaging;
      onMessage(messagingResolve, (payload) => {
        resolve(payload);
      });
    })()
  );
export const auth = getAuth(firebaseApp);
