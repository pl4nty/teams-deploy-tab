"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
require("isomorphic-fetch");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const AuthProvider_1 = require("./AuthProvider");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const TENANT_ID = core.getInput('TENANT_ID');
        const AAD_APP_ID = core.getInput('AAD_APP_ID');
        const TEAMS_APP_NAME = core.getInput('TEAMS_APP_NAME');
        const MANIFEST_PATH = core.getInput('MANIFEST_PATH');
        try {
            const client = microsoft_graph_client_1.Client.initWithMiddleware({
                authProvider: new AuthProvider_1.AuthProvider(TENANT_ID, AAD_APP_ID)
            });
            const apps = (yield client
                .api(`/appCatalogs/teamsApps`)
                .filter(`distributionMethod eq 'organization' and displayName eq '${TEAMS_APP_NAME}'`)
                .get()).value;
            if (apps) {
                yield client
                    .api(`/appCatalogs/teamsApps/${apps[0].id}/appDefinitions`)
                    .putStream((0, fs_1.createReadStream)(MANIFEST_PATH));
            }
            else {
                (0, fs_1.readFile)(MANIFEST_PATH, res => client
                    .api(`/appCatalogs/teamsApps`)
                    .header('Content-Type', 'application/zip')
                    .post(res));
            }
        }
        catch (error) {
            core.setFailed(error);
        }
    });
}
run();
