import CustosService from "../../service/custos-service";
import config from "../../../config";

export const custosService = new CustosService({
    clientId: config.value('clientId'),
    clientSecret: config.value('clientSec'),
    redirectURI: config.value('redirectURI'),
    baseURL: config.value('custosApiUrl')
});
