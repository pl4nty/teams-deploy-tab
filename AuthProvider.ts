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
    private app: string;

    constructor(app: string) {
        this.app = app;
    }

    public async getAccessToken(): Promise<string> {
        const start = Date.now();

        const res: DeviceAuthStart = await axios.get(`https://login.microsoftonline.com/organizations/oauth2/v2.0/devicecode`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: stringify({
                client_id: this.app,
                scope: [
                    "https://graph.microsoft.com/AppCatalog.ReadWrite.All"
                ].join(" ")
            })
        });

        console.log(res.message);
        console.log(`Link: ${res.verification_uri}`);
        console.log(`Code: ${res.user_code}`);

        return new Promise((resolve, reject) => {
            this.poll(resolve, reject, res.device_code, res.interval, start+res.expires_in*1000)
        });
    }

    private async poll(resolve, reject, code: string, interval: number, expiry: number) {
        if (Date.now() >= expiry) {
            resolve(await this.getAccessToken());
        } else {
            setTimeout(async () => {
                const poll: DeviceAuthPoll = await axios.get(`https://login.microsoftonline.com/organizations/oauth2/v2.0/`, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data: stringify({
                        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                        client_id: this.app,
                        device_code: code
                    })
                });

                if (!poll.error) {
                    resolve(poll.id_token);
                } else if (poll.error === "authorization_pending") {
                    this.poll(resolve, reject, code, poll.interval, expiry);
                } else {
                    resolve(await this.getAccessToken());
                }
            }, interval)
        }
    }
}