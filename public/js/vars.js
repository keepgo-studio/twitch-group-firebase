export const env = {
    FUNCTIONS_URL: "https://asia-northeast3-twitch-group.cloudfunctions.net",
    TWITCH_OAUTH_URL: "https://id.twitch.tv/oauth2"
}

export const descriptions = {
    "en": {
        "scopes": {
            "user:read:follows": "View the list of channels a user follows.",
            "channel:read:subscriptions": "View a list of all subscribers to a channel and check if a user is subscribed to a channel.",
        },

        "btn": "Update Twitch Account",

        "close": "You can close this tab"
    },

    "ko": {
        "scopes": {
            "user:read:follows": "유저가 팔로우한 채널들 정보를 조회할 권한",
            "channel:read:subscriptions": "채널 구독자를 조회하거나 유저가 특정 채널에 구독하였는지를 조회할 권한",
        },
        
        "btn": "계정 업데이트",

        "close": "현재 창을 닫으셔도 됩니다."
    }
}