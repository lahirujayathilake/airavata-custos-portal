import decode from "jwt-decode";
import {hasTokenExpired} from "../util/jwt.util";
import {custosService} from "../util/custos.util";

// const ACCESS_TOKEN_KEY = 'access_token';
// const ID_TOKEN_KEY = 'id_token';
// const REFRESH_TOKEN_KEY = 'refresh_token';

const state = {
    accessToken: null,
    idToken: null,
    refreshToken: null
};

const actions = {
    async init({commit}) {
        commit("SET_TOKENS", {
            accessToken: custosService.identity.accessToken,
            idToken: custosService.identity.idToken,
            refreshToken: custosService.identity.refreshToken
        });
    },
    async fetchAuthorizationEndpoint(obj, {ciLogonInstitutionEntityId = null} = {}) {
        const {clientId, redirectURI} = custosService;
        const {data: {authorization_endpoint}} = await custosService.identity.getOpenIdConfig();
        let url = `${authorization_endpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&scope=openid`;

        if (ciLogonInstitutionEntityId) {
            url += `&kc_idp_hint=oidc&idphint=${ciLogonInstitutionEntityId}`;
        } else {
            url += `&kc_idp_hint=oidc`;
        }

        window.location.href = url;
    },
    async authenticateUsingCode({commit}, {code}) {
        const {data: {access_token, id_token, refresh_token}} = await custosService.identity.getToken({code});
        commit("SET_TOKENS", {accessToken: access_token, idToken: id_token, refreshToken: refresh_token});
    },
    async authenticateLocally({commit}, {username, password}) {
        const {data: {access_token, id_token, refresh_token}} = await custosService.identity.localLogin({
            username, password
        });
        commit("SET_TOKENS", {accessToken: access_token, idToken: id_token, refreshToken: refresh_token});
    },
    async logout({commit}) {
        await custosService.identity.logout();
        commit("CLEAR_TOKENS");
    },
    async refreshAuthentication({commit, state}) {
        if (state.refreshToken && hasTokenExpired(state.refreshToken)) {
            await custosService.identity.getTokenUsingRefreshToken()
                .catch(() => commit("CLEAR_TOKENS"))
                .then((res) => {
                    if (!res || !res.data) {
                        commit("CLEAR_TOKENS")
                    } else {
                        const {data: {access_token, id_token, refresh_token}} = res;
                        commit("SET_TOKENS", {
                            accessToken: access_token,
                            idToken: id_token,
                            refreshToken: refresh_token
                        });
                    }
                });
        }
    }
}

const mutations = {
    SET_TOKENS(state, {accessToken, idToken, refreshToken}) {
        // custosService.identity.accessToken = accessToken;
        // custosService.identity.idToken = idToken;
        // custosService.identity.refreshToken = refreshToken;

        state.accessToken = accessToken;
        state.idToken = idToken;
        state.refreshToken = refreshToken;
    },
    CLEAR_TOKENS(state) {
        // custosService.identity.accessToken = null;
        // custosService.identity.idToken = null;
        // custosService.identity.refreshToken = null;

        state.accessToken = null;
        state.idToken = null;
        state.refreshToken = null;
    }
}

const getters = {
    accessToken(state) {
        return state.accessToken;
    },
    idToken(state) {
        return state.idToken;
    },
    refreshToken(state) {
        return state.refreshToken;
    },
    authenticated(state, getters) {
        if (getters.idToken && !hasTokenExpired(state.idToken)) {
            return true;
        } else {
            return false;
        }
    },
    isAdmin(state, getters) {
        try {
            let {realm_access: {roles}} = decode(getters.accessToken);
            return roles.indexOf("admin") >= 0;
        } catch (err) {
            return false;
        }
    },
    currentUsername(state, getters) {
        if (getters.accessToken) {
            try {
                let {preferred_username} = decode(getters.accessToken);
                return preferred_username;
            } catch (err) {
                return null
            }
        } else {
            return null
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
