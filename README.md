# Deploy an app to the Microsoft Teams app store
Creates or updates a Microsoft Teams custom app from a manifest zip file.

# Prerequisites
* Global administrator account (application-level permissions aren't supported)
* [AzureAD application](https://docs.microsoft.com/en-us/graph/auth-register-app-v2)

# Instructions
1. View the action logs while running (eg https://github.com/pl4nty/anutimetable/actions?query=is%3Ain_progress) 
2. Browse to the provided link within 15 minutes
3. Authenticate with a global administrator account
4. Check the box to grant admin consent for the requested permissions
4. Enter the provided code

# Inputs (required)
Variable | Description
-|-
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
        AAD_APP_ID: 342e5d4b-7fa3-400e-8bae-7035ee615a5e
        TEAMS_APP_NAME: My App
        MANIFEST_PATH: package/manifest.zip
      with:
        name: my-artifact
```