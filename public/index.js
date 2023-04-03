// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// // The Firebase SDK is initialized and available here!
//
// firebase.auth().onAuthStateChanged(user => { });
// firebase.database().ref('/path/to/ref').on('value', snapshot => { });
// firebase.firestore().doc('/foo/bar').get().then(() => { });
// firebase.functions().httpsCallable('yourFunction')().then(() => { });
// firebase.messaging().requestPermission().then(() => { });
// firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
// firebase.analytics(); // call to activate
// firebase.analytics().logEvent('tutorial_completed');
// firebase.performance(); // call to activate
//
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

let App;

const checkSDK = () => {
  try {
    App = firebase.initializeApp({
      apiKey: "AIzaSyCELMZaU76urD3O5_PxGPt1oE17r_gMcj4",
      authDomain: "twitch-group.firebaseapp.com",
      projectId: "twitch-group",
      storageBucket: "twitch-group.appspot.com",
      messagingSenderId: "320131693220",
      appId: "1:320131693220:web:fe8e5ee791b87bfc25c431",
      measurementId: "G-QG1QHTW0WE",
    });

    let features = [
      "auth",
      "database",
      // "firestore",
      "functions",
      // "messaging",
      // "storage",
      // "analytics",
      // "remoteConfig",
      // "performance",
    ].filter((feature) => typeof App[feature] === "function");

    console.log(`Firebase SDK loaded with ${features.join(", ")}`);
  } catch (e) {
    console.error(e);
    loadEl.textContent = "Error loading the Firebase SDK, check the console.";
  }
};

function main() {
  const authService = firebase.auth(App);

  const provider = new firebase.auth.OAuthProvider("oidc.twitch");

  document.querySelector("button").addEventListener("click", () => {
    authService
      .signInWithPopup(provider)
      .then((result) => {
        var credential = result.credential;

        // OAuth access and id tokens can also be retrieved:
        var accessToken = credential.accessToken;
        var idToken = credential.accessToken;

        console.log(result);
      })
      .catch((error) => {
        // Handle error.
        console.error(error);
      });
  });
}

document.addEventListener("DOMContentLoaded", main);
