import * as admin from "firebase-admin";
import * as firestore from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { defineString } from "firebase-functions/params";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

// const db = firestore.getFirestore();

// const collectionName = defineString("twitch-group-users-info");

const API_URL = "https://id.twitch.tv/oauth2";

const middleWareCheckTokenValid =
  (handler: Function) =>
  (req: functions.https.Request, res: functions.Response<any>) => {

    // req.params

    return handler(req, res);
  };

export const requestRefreshToken = functions.https.onRequest(
  async (req, res) => {
    // await fetch(`${API_URL}/token`, {
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: {
    //     grant_type:refresh_token
    //     refresh_token:gdw3k62zpqi0kw01escg7zgbdhtxi6hm0155tiwcztxczkx17&client_id=<your client id goes here>&client_secret=<your client secret goes here>
    //   }
    // });
  }
);

export const getFollowList = functions.https.onRequest(
  middleWareCheckTokenValid(
    (req: functions.https.Request, res: functions.Response<any>) => {
    }
  )
);
