import { descriptions } from "./vars.js";

export class PlayerSign extends HTMLElement {
    css = `
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }
        li {
            display: block;
        }
        main {
            width: 100%;
            border: 1px solid var(--my-gray2);
            border-radius: 8px;
            background: #fff;
            box-shadow: 0px 4px 8px 2px rgba(0, 0, 0, 0.07);
        }

        .permission-container {
            padding: 30px 0;
            width: 100%;
        }
        .permission-container h1 {
            font-family: "Twitchy";
            font-size: 26px;
            margin-bottom: 30px;
            padding-bottom: 30px;
            text-align: center;
        }

        .permission-container .permissions {
            padding: 0 20px;
        }
        .permission-container .permissions li {
            display: flex;
            align-items: center;
            height: 80px;
            letter-spacing: 0.13px;
            line-height: 20px;
        }
        .permission-container .permissions li:not(:last-child) {
            margin-bottom: 30px;
        }
        
        .permission-container .permissions li .img-container {
            width: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .permission-container .permissions li img {
            width: 24px;
        }
        .permission-container .permissions li .text-container {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            font-family: "Roboto", "sans-serif";
        }
        .permission-container .permissions li .text-container h3 {
            font-size: 22px;
        }
        .permission-container .permissions li .text-container p {
            color: var(--my-gray);
            font-size: 15px;
        }

        .button-container {
            min-height: 150px;
            border-top: 1px solid var(--my-gray2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .button-container #signin {
            background-color: var(--twitch-purple);
            height: 64px;
            width: 63%;
            font-family: "Twitchy";
            color: #fff;
            border-radius: 10px;
            font-size: 18px;
            border: none;
            transition: ease 300ms;
            cursor: pointer;
            box-shadow: 0px 4px 8px 2px rgba(0, 0, 0, 0.07);
        }
        .button-container #signin.deactive {
            background-color: var(--my-gray2);
            cursor: not-allowed;
            filter: brightness(70%);
        }
        .button-container #signin span {
            position:relative;
            top: -10px;
        }
        .button-container #signin:not(.deactive):hover {
            filter: brightness(90%);
        }
    `;

    provider;
    scopesIconMap = {
        "user:read:follows": "follows.svg",
        "channel:read:subscriptions": "subscribe.svg",
    }

    lang = document.documentElement.lang;

    isChecking = true;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.provider = new firebase.auth.OAuthProvider("oidc.twitch");
        Object.keys(this.scopesIconMap).forEach(scope => this.provider.addScope(scope));

        if (!(this.lang === "ko" || this.lang === "en")) this.lang = "en";

        this.addEventListener("checked", (ev) => {
            if (ev.detail.valid) {
                console.log("you don't need to login!");
                // const close = document.createElement("auto-close");

                // document.querySelector("#root .player-container").appendChild(close);

                // this.remove();
                return;
            }

            this.isChecking = false;
            this.render();
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${this.css}</style>

            <main>

                <section class="permission-container">
                    <h1>REQUESTING <span style="color: var(--twitch-purple)">PREMISSIONS</span></h1>

                    <ul class="permissions">
                        ${Object.keys(this.scopesIconMap).map((scope) => `
                            <li>
                                <div class="img-container">
                                    <img src="assets/${this.scopesIconMap[scope]}">
                                </div>
                                <div class="text-container">
                                    <h3>${scope}</h3>
                                    <p>${descriptions[this.lang].scopes[scope]}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </section>

                <section class="button-container">
                    <button id="signin"><span>${this.isChecking? "Checking" : "Update Account"}</span></button>
                </section>
            </main>
        `;

        this.attachEventListener();
        
        this.attachAnimation();
    }

    attachEventListener() {
        this.shadowRoot
            .querySelector("button#signin")
            .addEventListener("click", async () => {
                if (this.isChecking) return;

                // firebase.auth().signInWithRedirect(this.provider)
                firebase.auth()
                    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => firebase.auth().signInWithRedirect(this.provider))
                    .catch((err) => console.error(err));
            });
    }

    sec = 0;
    tid;
    attachAnimation() {
        clearInterval(this.tid);

        if (this.isChecking) {
            this.shadowRoot.querySelector("button#signin").classList.add("deactive");

            this.tid = setInterval(() => {
                this.sec++;

                this.shadowRoot.querySelector("button#signin span").textContent = 
                    `Checking${".".repeat(this.sec % 4)}`;
            }, 1000);
        }
    }

    connectedCallback() {
        this.render();
    }
}