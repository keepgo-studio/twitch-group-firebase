const FUNCTIONS_URL_LOCAL =
  "http://localhost:5001/twitch-group/asia-northeast3";
const FUNCTIONS_URL = "https://asia-northeast3-twitch-group.cloudfunctions.net";

const checkSDK = (config) => {
  try {
    firebase.initializeApp(config);

    let features = [
      "auth",
      "database",
      "firestore",
      "functions",
      "messaging",
      "storage",
      "analytics",
      "remoteConfig",
      "performance",
    ].filter((feature) => typeof firebase.app()[feature] === "function");

    console.log(`Firebase SDK loaded with ${features.join(", ")}`);
  } catch (e) {
    console.error(e);
  }
};

const loginSuccess = async (result) => {
  const credential = result.credential;
  const userInfo = result.additionalUserInfo;

  const accessToken = credential.accessToken;
  const currentUserId = userInfo.profile.sub;

  console.log(result);

  await fetch(`${FUNCTIONS_URL_LOCAL}/getFollowList`, {
    method: "GET",
    headers: {
      access_token: accessToken,
      current_user_id: currentUserId,
    },
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));

  // await fetch(`${FUNCTIONS_URL_LOCAL}/saveToken`, {
  //   method: 'GET',
  //   headers: {
  //     access_token: accessToken,
  //   },
  // })
  //   .then((res) => res.json())
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));
};

function main() {
	const firebaseConfig = {
		apiKey: "AIzaSyCELMZaU76urD3O5_PxGPt1oE17r_gMcj4",
		authDomain: "twitch-group.firebaseapp.com",
		databaseURL:
			"https://twitch-group-default-rtdb.asia-southeast1.firebasedatabase.app",
		projectId: "twitch-group",
		storageBucket: "twitch-group.appspot.com",
		messagingSenderId: "320131693220",
		appId: "1:320131693220:web:fe8e5ee791b87bfc25c431",
		measurementId: "G-QG1QHTW0WE",
	};

	localStorage.setItem('firebase-config', JSON.stringify(firebaseConfig));

  checkSDK(firebaseConfig);

  const auth = firebase.auth();

  const provider = new firebase.auth.OAuthProvider("oidc.twitch");

  provider.addScope("user:read:follows");
  provider.addScope("channel:read:subscriptions");

	if (auth.currentUser) {
    console.log(auth.currentUser)
  }
	
  document.querySelector("button#login").addEventListener("click", async () => {
    auth
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => auth.signInWithRedirect(provider))
      .then((result) => console.log('login success!', result))
      .catch((err) => console.error(err));
  });

  document
    .querySelector("button#logout")
    .addEventListener("click", async () => {
      auth
        .signOut()
        .then(() => console.log("sign out!"))
        .catch((err) => console.error(err));
    });
}

window.addEventListener("DOMContentLoaded", main);