import {custosService} from "../util/custos.util";
import axios from "axios";


const state = {
    userinfo: null
};

const actions = {
    async init() {
        // TODO
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
    async logout({commit}) {
        await custosService.identity.logout();
        commit("CLEAR_USERINFO");
    },
    async fetchUserinfo({commit, state}) {
        if (!state.userinfo) {
            await axios.get("/api/userinfo")
                .catch(() => commit("CLEAR_USERINFO"))
                .then((res) => {
                    console.log("###### userinfo res", res);
                    if (!res || !res.data) {
                        commit("CLEAR_USERINFO");
                    } else {
                        commit("SET_USERINFO", res.data);
                    }
                });
        }
    }
}

const mutations = {
    SET_USERINFO(state, userinfo) {
        state.userinfo = userinfo;
    },
    CLEAR_USERINFO(state) {
        state.userinfo = null;
    }
}

const getters = {
    authenticated(state) {
        return !!state.userinfo;
    },
    isAdmin(state) {
        if (state.userinfo) {
            try {
                let {realm_access: {roles}} = state.userinfo;
                return roles.indexOf("admin") >= 0;
            } catch (err) {
                return false;
            }
        } else {
            return null
        }
    },
    currentUsername(state) {
        if (state.userinfo) {
            try {
                let {preferred_username} = state.userinfo;
                return preferred_username;
            } catch (err) {
                return null;
            }
        } else {
            return null;
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
