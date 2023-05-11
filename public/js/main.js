import { PlayerSign } from "./components.js";
import { env } from "./vars.js";


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

function checkSDK() {
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

    console.log(`Firebase SDK 8 loaded with ${features.join(", ")}`);
}

async function checkTokenValid(accessToken) {
    return await fetch(`${env.TWITCH_OAUTH_URL}/validate`, {
            method: 'GET',
            headers: {
                "Authorization": `OAuth ${"b6715e2ff71d22249895002366830477286784e3"}`
            }
        })
        .then((res) => (res.status === 200) ? true : false)
        .catch(() => false);
}

async function asyncTrackUser(electron_port) {
    const player = document.querySelector("player-sign");

    const r = await firebase.auth().getRedirectResult()
    .then((result) => {
        // IdP data available in result.additionalUserInfo.profile.
        // ...

        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // OAuth access and id tokens can also be retrieved:
        var accessToken = credential.accessToken;
        var idToken = credential.idToken;

        console.log("redirect", result);

        return result;
    })
    .catch((error) => {
        // Handle error.
    });

    console.log("await", r);

    firebase.auth().onAuthStateChanged(async (user) => {
        // remove loading
        document.getElementById("loading").style.display = "none";
        document.getElementById("root").style.display = "block";
        document.querySelector(".body_background").style.backgroundColor = "var(--ice)";

        if (user) {
            const uid = user.uid,
            currentUserId = user.providerData[0].uid,
            accessToken = user.auth.currentUser.accessToken;
            
            const result = await checkTokenValid(accessToken);
            
            console.log(user, accessToken);
            console.log(firebase.auth(), firebase.auth)

            user.getIdTokenResult().then(function(idTokenResult) {
                // You can access the user's ID token via idTokenResult.token
                // You can also check other properties of the token via idTokenResult.claims
                console.log(idTokenResult.token)
              }).catch(function(error) {
                // Handle error
              });

            if (!result) {
                // await firebase.auth()
                //     .signOut()
                //     .then(() => location.reload())
                //     .catch((err) => reloadPage("sign out error", "please reload window manually"));
            } else {
                // sync user profile with electron
                await fetch(`http://localhost:${electron_port}/update`, {
                    method: "POST",
                    body: JSON.stringify({
                        uid,
                        current_user_id: currentUserId,
                        access_token: accessToken,
                    }),
                })
                // if success, close tab
                .then(() => player.dispatchEvent(new CustomEvent("checked", {
                    detail: {
                        valid: true
                    }
                })))
                // if failed, tell user try again after reload
                .catch(
                    (err) => (document.getElementById("reload").style.display = "block")
                );
            }
        } 
        else {
            player.dispatchEvent(new CustomEvent("checked", {
                detail: {
                    valid: false
                }
            }));
        }
    });
}

function reloadPage(err, msg) {
    alert(`
        [Error]: ${err}
        ${msg}
    `);

    location.reload();
}

function error400(msg) {
    document.getElementById("error-400").style.display = "block";

    throw new Error(msg);
}

function getPort() {
    const url = new URL(location.href);
    const port = url.searchParams.get("port");

    return port;
}

function main() {
    const electron_port = getPort();

    if (!electron_port) {
        error400("Cannot find port");
    }

    try {
        checkSDK();
    } catch (err) {
        error400(err);
    }

    // init firebase app
    firebase.initializeApp(firebaseConfig);
    
    // active app
    customElements.define("player-sign", PlayerSign);
    const player = document.createElement("player-sign");
    document.querySelector("#root .player-container").appendChild(player);

    asyncTrackUser(electron_port);
}

window.addEventListener("DOMContentLoaded", main);
