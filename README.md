# Leaderboard-game-services-template
Leaderboard game service with templates for developer to use with Unity SDK of Leaderboard
The template is built using the NestJS framework. To get started, follow these steps:

## Step 1. Install Dependencies
To install the necessary dependencies, use one of the following commands:

```bash
yarn
```

or if using npm: 
```bash
npm install
```

## Step 2. Configure the Database
After installing dependencies, set up the database using PostgreSQL. Define the following environment variables in your `.env` file to configure the database connection:

Example: 
```bash
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=local-database-test

```

## Step 3. Fill in the Environment Variables
In your initial setup, you can set the PUBLIC_RSA_KEY and PRIVATE_RSA_KEY to N/A so that the service can start:

```bash
PUBLIC_RSA_KEY=N/A
PRIVATE_RSA_KEY=N/A
DEVELOPER_API_KEY="YOUR_DEVELOPER_API_KEY"
```

## Step 4. Run the service
Once your environment variables are set, run the following command to start the service in development mode:

```bash
yarn start:dev
```
or if using npm: 

```bash
npm run dev
```

## Step 5. Access the swagger in local server.
After the service starts successfully, you can access the Swagger documentation at:

`http://localhost:3001/documentation`

There should have full list of setup API for interact with Unity client

## Step 6. Generate RSA Key Pairs

From here, you can use the `leaderboards/generate-keys endpoint` to generate your RSA public and private keys.

Example Link: `http://localhost:3001/documentation#/leaderboard/LeaderboardController_generateRSAKeys`


Example :

1. Endpoint for generate RSA Key pairs.

![generate-rsa-key-pairs-step-1](/img/unity-sdk/Generate_key_part_1.png)

2. Generate RSA Keypair though local endpoint.

![generate-rsa-key-pairs-step-2](/img/unity-sdk/Generate_key_part_2.png)


## Step 7. Update the Environment with RSA Keys
Once the RSA key pairs are generated, update your `.env` file with the following:

```bash
PUBLIC_RSA_KEY=your_generated_public_key
PRIVATE_RSA_KEY=your_generated_private_key
```

Put the Developer API Key in the `.env` file.
```bash
DEVELOPER_API_KEY=Your_developer_api_key
```


## Step 8. Configure Unity Client
Ensure that you configure the Myria Leaderboard SDK in Unity by passing the `PUBLIC_RSA_KEY` in the SDK config to enable secure communication with the backend.

By following these steps, your backend service should be successfully set up and ready to integrate with your Unity game.

