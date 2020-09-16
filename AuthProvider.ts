import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import axios from 'axios';
import { stringify } from 'querystring';

export class AuthProvider implements AuthenticationProvider {
    private tenant;
    private app;
    private secret;

    constructor(tenant, app, secret) {
        this.tenant = tenant;
        this.app = app;
        this.secret = secret;
    }

    public async getAccessToken(): Promise<string> {
        const res: {
            "token_type": string,
            "expires_in": number,
            "access_token": string
        } = await axios.get(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: stringify({
                client_id: this.app,
                scope: this.teamsToken,
                client_secret: this.secret,
                grant_type: 'client_credentials'
            })
        })

        return res.access_token;
    }
}