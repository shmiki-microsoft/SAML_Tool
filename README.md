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

# Service Provider (SP) Configuration
SP_PRIVATE_KEY_FILE=key-file.pem
SP_CERT_FILE=cert-file.crt

# Identity Provider (IdP) Configuration
IDP_CERT_FILE=saml2-js.cer
```

### 3. Set Up Keys and Certificates

1. Create a `keys` directory in the root of the project.
2. Inside the `keys` directory, create two subdirectories: `SP` and `IdP`.
3. Store the Service Provider (SP) private key and certificate in the `SP` directory.
4. Store the Identity Provider (IdP) certificate in the `IdP` directory.

To generate the SP private key and certificate using OpenSSL, run the following command:

```bash
openssl req -x509 -days 3650 -nodes -newkey rsa:4096 -keyout ./keys/SP/key-file.pem -out ./keys/SP/cert-file.crt
```

### 4. Running the Application

For local deployment, navigate to the `app` directory and run the following command:

```bash
npm run dev
```

Alternatively, you can use the VSCode debugger to launch the application.
