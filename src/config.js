import dotenv from 'dotenv'
dotenv.config()

export default class Configuration {
    static get CONFIG () {
        return {
            clientId: '$VUE_APP_CLIENT_ID',
            clientSec: '$VUE_APP_CLIENT_SEC',
            redirectURI: '$VUE_APP_REDIRECT_URI',
            custosApiUrl: '$VUE_APP_CUSTOS_API_URL',
            superClientId: '$VUE_APP_SUPER_CLIENT_ID'
        }
    }

    static value (name) {

        if (!(name in this.CONFIG)) {
            console.log(`Configuration: There is no key named "${name}"`)
            return
        }

        const value = this.CONFIG[name]


        if (!value) {
            console.log(`Configuration: Value for "${name}" is not defined`)
            return
        }

        if (value.startsWith('$VUE_APP_')) {
            // value was not replaced, it seems we are in development.
            // Remove $ and get current value from process.env
            const envName = value.substr(1)
            const envValue = process.env[envName]
            if (envValue) {
                return envValue
            } else {
                console.log(`Configuration: Environment variable "${envName}" is not defined`)
            }
        } else {
            // value was already replaced, it seems we are in production.
            return value
        }
    }
}