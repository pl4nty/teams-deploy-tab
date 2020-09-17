import * as core from "@actions/core"; 
import { createReadStream, readFile } from "fs";
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import * as Responses from "@microsoft/microsoft-graph-types";
import { AuthProvider } from "./AuthProvider";

async function run() {
  const TENANT_ID = core.getInput('TENANT_ID');
  const AAD_APP_ID = core.getInput('AAD_APP_ID');
  const TEAMS_APP_NAME = core.getInput('TEAMS_APP_NAME');
  const MANIFEST_PATH = core.getInput('MANIFEST_PATH');

  try {
    const client = Client.initWithMiddleware({
      authProvider: new AuthProvider(TENANT_ID, AAD_APP_ID)
    });

    console.log(TEAMS_APP_NAME)

    const apps: {
      id: string,
      externalId: string,
      displayName: string,
      distributionMethod: Responses.TeamsAppDistributionMethod
    }[] = (await client
      .api(`/appCatalogs/teamsApps`)
      .filter(`distributionMethod eq 'organization' and displayName eq '${TEAMS_APP_NAME}'`)
      .get()).value;

    if (apps) {
      await client
        .api(`/appCatalogs/teamsApps/${apps[0].id}/appDefinitions`)
        .putStream(createReadStream(MANIFEST_PATH))
    } else {
      readFile(MANIFEST_PATH, res => client
        .api(`/appCatalogs/teamsApps`)
        .header('Content-Type', 'application/zip')
        .post(res))
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();
