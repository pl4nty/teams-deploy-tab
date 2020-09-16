# GitHub action to deploy a custom tab to Microsoft Teams
Updates a Microsoft Teams custom app in a tenant from a manifest file.

# Prerequisites
* [Register an application in AzureAD with the Application-level Group.ReadWrite.All permission](https://docs.microsoft.com/en-us/graph/auth-register-app-v2)

# Variables
* Tenant (Directory) ID
* Application ID
* Application (Client) secret

# Example
```yml
on: push
name: Deploy to Teams

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@master

    - name: Deploy
      uses: pl4nty/teams-deploy-tab@v1
      env:
        TENANT_ID: ${{ secrets.TENANT_ID }}
        APP_ID: ${{ secrets.APP_ID }}
        APP_SECRET: ${{ secrets.APP_SECRET }}
```