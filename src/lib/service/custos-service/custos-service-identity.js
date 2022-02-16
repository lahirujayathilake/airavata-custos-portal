import CustosService from "./index";

const ACCESS_TOKEN_KEY = 'access_token';
const ID_TOKEN_KEY = 'id_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export default class CustosIdentity {
    /**
     * @type {CustosService}
     */
    _custosService = null;
    changeListeners = [];

    constructor(custosService) {
        this._custosService = custosService;

        window.addEventListener('storage', (e) => {
            for (let i = 0; i < this.changeListeners.length; i++) {
                this.changeListeners[i] && typeof this.changeListeners[i] === "function" && this.changeListeners[i](e);
            }
        });
    }

    get accessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    set accessToken(accessToken) {
        if (accessToken == null) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        } else {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }
    }

    get refreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    set refreshToken(refreshToken) {
        if (refreshToken == null) {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    get idToken() {
        return localStorage.getItem(ID_TOKEN_KEY);
    }

    set idToken(idToken) {
        if (idToken == null) {
            localStorage.removeItem(ID_TOKEN_KEY);
        } else {
            localStorage.setItem(ID_TOKEN_KEY, idToken);
        }
    }

    get custosService() {
        return this._custosService;
    }

    onChange(changeListener) {
        this.changeListeners.push(changeListener);
    }

    async getOpenIdConfig() {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization();
        return axiosInstance.get(
            `${CustosService.ENDPOINTS.IDENTITY}/.well-known/openid-configuration`,
            {
                params: {'client_id': this.custosService.clientId}
            }
        );
    }

    _saveTokenResponse(response) {
        const {data: {access_token, id_token, refresh_token}} = response;

        this.accessToken = access_token;
        this.idToken = id_token;
        this.refreshToken = refresh_token;

        return response;
    }

    async getToken({code}) {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization();
        return axiosInstance.post(
            `${CustosService.ENDPOINTS.IDENTITY}/token`,
            {'code': code, 'redirect_uri': this.custosService.redirectURI, 'grant_type': 'authorization_code'}
        ).then(this._saveTokenResponse.bind(this));
    }

    async localLogin({username, password}) {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization();
        return axiosInstance.post(
            `${CustosService.ENDPOINTS.IDENTITY}/token`,
            {'grant_type': 'password', 'username': username, 'password': password}
        ).then(this._saveTokenResponse.bind(this));
    }

    async logout() {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization();
        return axiosInstance.post(
            `${CustosService.ENDPOINTS.IDENTITY}/user/logout`,
            {refresh_token: this.refreshToken}
        ).then(() => {
            this.accessToken = null;
            this.idToken = null;
            this.refreshToken = null;
        })
    }

    async getTokenUsingRefreshToken() {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization();
        return axiosInstance.post(
            `${CustosService.ENDPOINTS.IDENTITY}/token`,
            {'refresh_token': this.custosService.identity.refreshToken, 'grant_type': 'refresh_token'}
        ).then(this._saveTokenResponse.bind(this));
    }

    getClientSecret({clientId}) {
        return this.custosService.axiosInstanceWithTokenAuthorization.get(
            `${CustosService.ENDPOINTS.IDENTITY}/credentials`,
            {
                params: {
                    "client_id": clientId
                }
            }
        ).then(({data: {custos_client_secret}}) => custos_client_secret);
    }

}
