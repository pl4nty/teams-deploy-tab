import { info } from '@actions/core';
import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import axios from 'axios';
import { stringify } from 'querystring';

class DeviceAuthStart {
    "device_code": string;
    "user_code": string;
    "verification_uri": string;
    "expires_in": number;
    "interval": number;
    "message": string
}

class DeviceAuthPoll {
    "token_type": string;
    "scope": string;
    "expires_in": number;
    "access_token": string;
    "refresh_token": string;
    "id_token": string;
    "error"?: string;
    "interval"?: number
}
export class AuthProvider implements AuthenticationProvider {
    private tenant: string;
    private app: string;

    constructor(tenant: string, app: string) {
        this.tenant = tenant;
        this.app = app;
    }

    public async getAccessToken(): Promise<string> {
        const start = Date.now();

        const res: DeviceAuthStart = (await axios.post(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/devicecode`, stringify({
            client_id: this.app,
            scope: "https://graph.microsoft.com/AppCatalog.ReadWrite.All"
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })).data;

        info(res.message);

        return new Promise((resolve, reject) => {
            // Calculate epoch expiry time
            const expiry = start + res.expires_in*1000;

            const interval = setInterval(async () => {
                // Retry on timeout
                if (Date.now() >= expiry) {
                    clearInterval(interval);
                    resolve(await this.getAccessToken());
                } else {
                    try {
                        const poll: DeviceAuthPoll = (await axios.post(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`, stringify({
                            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                            client_id: this.app,
                            device_code: res.device_code
                        }), {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })).data;

                        resolve(poll.access_token);
                    } catch (err) {
                        if (err.response.data.error !== "authorization_pending") {
                            clearInterval(interval);
                            info("Session expired, trying again...");
                            resolve(await this.getAccessToken());
                        }
                    }
                }
            }, res.interval*1000)
        });
    }
}