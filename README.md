# SuAir-backend

Backend for my bachelor's degree project

# Link to the postman workspace:

```
https://dark-desert-588371.postman.co/workspace/My-Workspace~1c8ec03f-a7dd-436f-844a-a7a91714e3cf/collection/23637998-1d5ed673-e398-46a5-ae76-4156baf285bf?action=share&creator=23637998
```

# Start commands:

```
npm install
```

You need a mongo database specifically mongoDB compass in order to run this code.
First time to get some test data run the cron job with the following commands:
These commands will load the data from the json files.

```
node Jobs/get_hourly_data.js 
node Jobs/get_daily_data.js
node Jobs/get_monthly_data.js
```

Start the server in order to test the routes.

```
npm start
```
