import CustosService from "./index";

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

    get custosService() {
        return this._custosService;
    }

    onChange(changeListener) {
        this.changeListeners.push(changeListener);
    }

    async getOpenIdConfig() {
        const axiosInstance = await this.custosService.axiosInstance;
        return axiosInstance.get(
            `${CustosService.ENDPOINTS.IDENTITY}/.well-known/openid-configuration`,
            {
                params: {'client_id': this.custosService.clientId}
            }
        );
    }

    async logout() {
        // TODO
    }

    getClientSecret({clientId}) {
        return this.custosService.axiosInstance.get(
            `${CustosService.ENDPOINTS.IDENTITY}/credentials`,
            {
                params: {
                    "client_id": clientId
                }
            }
        ).then(({data: {custos_client_secret}}) => custos_client_secret);
    }

}
