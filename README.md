# Deploy an app to the Microsoft Teams app store
Creates or updates a Microsoft Teams custom app from a manifest zip file.

# Prerequisites
* Global administrator account (application-level permissions aren't supported)

# Setup
1. [Register an AzureAD application](https://docs.microsoft.com/en-us/graph/auth-register-app-v2)
2. Copy the Tenant and Application IDs
3. Navigate to the Authentication tab
4. Configure the Reply URI as `https://login.microsoftonline.com/common/oauth2/nativeclient`
5. Enable "Treat application as a public client" (at the bottom)
6. Navigate to the API permissions page
7. Add the Microsoft Graph `AppCatalog.ReadWrite.All` Delegated permission and grant admin consent

# Usage
1. View the action logs while running (eg https://github.com/pl4nty/teams-deploy-tab/actions?query=is%3Ain_progress) 
2. Browse to the provided link within 15 minutes
3. Authenticate with a global administrator account
4. Enter the provided code

# Inputs (required)
Variable | Description
-|-
TENANT_ID | AzureAD Tenant ID
AAD_APP_ID | AzureAD application ID
TEAMS_APP_NAME | App display name
MANIFEST_PATH | Path to the manifest file

# Example
```yml
on: push
name: Deploy to Teams
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Download build artifact
      uses: actions/download-artifact@v2
      with:
        name: my-artifact

    - name: Deploy to Teams store
      uses: pl4nty/teams-deploy-tab@v1
      env:
        TENANT_ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
        AAD_APP_ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
        TEAMS_APP_NAME: My App
        MANIFEST_PATH: package/manifest.zip
```