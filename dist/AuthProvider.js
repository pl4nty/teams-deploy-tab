"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = void 0;
const core_1 = require("@actions/core");
const axios_1 = __importDefault(require("axios"));
const querystring_1 = require("querystring");
class DeviceAuthStart {
}
class DeviceAuthPoll {
}
class AuthProvider {
    constructor(tenant, app) {
        this.tenant = tenant;
        this.app = app;
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            const res = (yield axios_1.default.post(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/devicecode`, querystring_1.stringify({
                client_id: this.app,
                scope: "https://graph.microsoft.com/AppCatalog.ReadWrite.All"
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })).data;
            core_1.info(res.message);
            return new Promise((resolve, reject) => {
                // Calculate epoch expiry time
                const expiry = start + res.expires_in * 1000;
                const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    // Retry on timeout
                    if (Date.now() >= expiry) {
                        clearInterval(interval);
                        resolve(yield this.getAccessToken());
                    }
                    else {
                        try {
                            const poll = (yield axios_1.default.post(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`, querystring_1.stringify({
                                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                                client_id: this.app,
                                device_code: res.device_code
                            }), {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })).data;
                            resolve(poll.access_token);
                        }
                        catch (err) {
                            if (err.response.data.error !== "authorization_pending") {
                                clearInterval(interval);
                                core_1.info("Session expired, trying again...");
                                resolve(yield this.getAccessToken());
                            }
                        }
                    }
                }), res.interval * 1000);
            });
        });
    }
}
exports.AuthProvider = AuthProvider;
