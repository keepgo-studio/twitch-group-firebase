import axios from "axios";
import * as Admin from "firebase-admin";
// import * as Auth from "firebase-admin/auth";
import * as Functions from "firebase-functions";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

Admin.initializeApp();

const OAUTH_URL = "https://id.twitch.tv/oauth2";
const API_URL = "https://api.twitch.tv/helix";

const middlewareSetCORS =
  (handler: Function) =>
  async (req: Functions.https.Request, res: Functions.Response<any>) => {
    const allowedOrigins = [
      // "http://localhost:5000",
      // "http://localhost:5002",
      "https://twitch-group.firebaseapp.com",
      "chrome-extension://eopaojfffcnicocfoblahhgdahcemiak",
    ];

    console.log(req.headers.origin);

    if (!req.headers.origin) {
      res.status(400).send("Cannot recognize origin");
      return;
    }

    const url = allowedOrigins.find((url) => url === req.headers.origin);

    res.header({
      "Access-Control-Allow-Origin": url,
    });

    return handler(req, res);
  };

// const requestRefreshToken = async (access_token: string) => {
//   const params: Record<string, string> = {
//     client_id: process.env.TWITCH_CLIENT_ID,
//     client_secret: process.env.TWITCH_CLIENT_SECRET,
//     grant_type: "refresh_token",
//     // TODO refresh_token: ,
//   };

//   const encodedParams = Object.keys(params)
//     .map(
//       (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
//     )
//     .join("&");
//   console.log(encodedParams);

//   // return await axios.post(
//   //   `${OAUTH_URL}/token`,
//   //   encodedParams,
//   //   {
//   //     headers: {
//   //       "Content-Type": "application/x-www-form-urlencoded",
//   //     },
//   //   }
//   // );
// };
/**
 * Check valid only when method is GET
 */
const middlewareCheckTokenValid =
  (handler: Function) =>
  async (req: Functions.https.Request, res: Functions.Response<any>) => {
    switch (req.method) {
      case "GET":
        const { access_token } = req.headers;

        if (!access_token) {
          res
            .status(422)
            .send(`attribute \'access_token\' should contain at body`);
          return;
        }

        await axios
          .get(`${OAUTH_URL}/validate`, {
            headers: {
              Authorization: `OAuth ${access_token}`,
            },
          })
          .then(() => (req.params.valid = "true"))
          .catch(async (err) => {
            
          });
        break;
    }
    res.header({
      "Access-Control-Allow-Headers": "access_token",
    });
    return handler(req, res);
  };

export const getFollowList = Functions.region(
  "asia-northeast3"
).https.onRequest(
  middlewareSetCORS(
    middlewareCheckTokenValid(
      async (req: Functions.https.Request, res: Functions.Response<any>) => {
        const followList: Array<any> = [];

        switch (req.method) {
          case "GET":
            const { current_user_id, access_token } = req.headers;

            if (!current_user_id) {
              res
                .status(422)
                .send(`attribute \'access_token\' should contain at body`);
              return;
            }

            const followListResponse = await axios
              .get(`${API_URL}/streams/followed`, {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  "Client-Id": process.env.TWITCH_CLIENT_ID,
                },
                params: {
                  user_id: current_user_id,
                },
              })
              .then((result) => result.data)
              .catch((err) => console.error(err));
            
            followList.push(...followListResponse.data);

          case "OPTIONS":
            res
              .header({
                "Access-Control-Allow-Headers": [
                  "access_token",
                  "current_user_id",
                ],
              })
              .status(200)
              .send({
                follow_list: followList,
              });
            break;
          default:
            res.status(415).send("only GET method supported for this url");
        }
      }
    )
  )
);
