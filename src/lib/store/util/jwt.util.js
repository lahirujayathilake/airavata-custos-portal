import decode from "jwt-decode";


export function hasTokenExpired(token) {
    const expirationDate = getTokenExpirationDate(token);
    return !!expirationDate && expirationDate < new Date();
}

export function getTokenExpirationDate(encodedToken) {
    try {
        if (!encodedToken) {
            return null;
        }

        const token = decode(encodedToken);
        if (!token.exp) {
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(token.exp);
        return date;
    } catch (err) {
        return null;
    }
}