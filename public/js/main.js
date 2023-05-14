import { env } from "./vars.js";
import "./components.js";


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
                "Authorization": `OAuth ${accessToken}`
            }
        })
        .then((res) => (res.status === 200) ? true : false)
        .catch(() => false);
}

function resolveLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("root").style.display = "block";
    document.querySelector(".body_background").style.backgroundColor = "var(--ice)";
}

async function asyncTrackUser(electron_port) {
    const player = document.querySelector("player-sign");

    const result = await firebase.auth().getRedirectResult()
        .then((r) => r)
        .catch((error) => undefined);

    resolveLoading();

    if (!result || !result.credential) {
        player.dispatchEvent(new CustomEvent("checked", {
            detail: {
                valid: false
            }
        }));
    }
    else {
        const credential = result.credential;
        const profile = result.additionalUserInfo.profile;

        const accessToken = credential.accessToken;
        const twitchId = profile.sub;
        const twitchUsername = profile.preferred_username;

        const isValid = await checkTokenValid(accessToken);

        if (!isValid) {
            await firebase.auth()
                .signOut()
                .then(() => reloadPage("", "plz retry authorization, there some error with getting token"))
                .catch(() => reloadPage("error while sign out", "some error while sign out, close all window and retry"))
            return;
        }

        await fetch(`http://localhost:${electron_port}/update`, {
                method: "POST",
                body: JSON.stringify({
                    username: twitchUsername,
                    current_user_id: twitchId,
                    access_token: accessToken,
                }),
            })
            // if success, close tab
            .then(() => player.dispatchEvent(new CustomEvent("checked", {
                detail: {
                    valid: true
                }
            })))// if failed, tell user try again after reload
            .catch(
                (err) => (reloadPage("error while updating user", "you should use this site with twich player program"))
            );
    }
}

function reloadPage(err, msg) {
    alert(`${err !== ""? `[Error]:${err}` : ""}\n${msg}`);

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

async function checkPlayerOpened(port) {
    return await fetch(`http://localhost:${port}/public/check.json`)
        .then((res) => res.json())
        .then((data) => true)
        .catch(() => false);
}

let iid;
function beepConnection(port) {
    const url = new URL(location.href);
    const pingTime = url.searchParams.get("ping");

    iid = setInterval(() => {
        console.log("send connection");

        fetch(`http://localhost:${port}/conncetion`, {
            cache: "no-store"
        })
        .then(() => true)
        .catch(() => clearInterval(iid));
    }, pingTime);
}

async function main() {
    const electron_port = getPort();

    if (!electron_port) {
        error400("Cannot find port");
    }

    if (!(await checkPlayerOpened(electron_port))) {
        error400("Player app should be open");
    }

    try {
        checkSDK();
    } catch (err) {
        error400(err);
    }

    // init firebase app
    firebase.initializeApp(firebaseConfig);
    
    // active app
    const player = document.createElement("player-sign");
    document.querySelector("#root .player-container").appendChild(player);

    asyncTrackUser(electron_port);

    beepConnection(electron_port);
}

window.addEventListener("DOMContentLoaded", main);