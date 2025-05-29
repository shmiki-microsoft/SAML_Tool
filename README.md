## Deployment Instructions

To deploy this application locally, please follow the steps below:

### 1. Configure VSCode Launch Settings

Create a `.vscode/launch.json` file with the following content:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/app/app.js",
            "envFile": "${workspaceFolder}/.env"
        }
    ]
}
```

### 2. Create the `.env` File

Create a `.env` file in the root of the project with the following content:

```env
# Server Configuration
SERVER_PORT=3000
HOST=http://localhost:3000

#Logger Config
LOG_LEVEL=all # all, info, err, warn or debug
```

### 3. Running the Application
Please confirm that the current folder and file structure is as follows.

![image](https://github.com/user-attachments/assets/eccbe291-db4c-4d0a-b471-11576079f277)

For local deployment, navigate to the `app` directory.
When running the application for the first time, execute following command:
```
npm install
```

Run the following command:
```
npm run dev
```

Alternatively, you can use the VSCode debugger to launch the application.
