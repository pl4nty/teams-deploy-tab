import * as core from "@actions/core"; 
import { createReadStream, readFile } from "fs";
import { Client } from "@microsoft/microsoft-graph-client";
import * as Responses from "@microsoft/microsoft-graph-types";
import { AuthProvider } from "./AuthProvider";

async function run() {
  const AAD_APP_ID = core.getInput('AAD_APP_ID');
  const TEAMS_APP_NAME = core.getInput('TEAMS_APP_NAME');
  const MANIFEST_PATH = core.getInput('MANIFEST_PATH');

  try {
    const client = Client.initWithMiddleware({
      authProvider: new AuthProvider(AAD_APP_ID)
    });

    const apps: {
      id: string,
      externalId: string,
      name: string,
      version: string,
      distributionMethod: Responses.TeamsAppDistributionMethod
    }[] = (await client
      .api(`/appCatalogs/teamsApps`)
      .filter(`distributionMethod eq 'organization' and name eq '${TEAMS_APP_NAME}'`)
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
    core.setFailed(error.message);
  }
}

run();
