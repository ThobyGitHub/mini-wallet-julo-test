<h2>Mini Wallet Study Case</h2>

## About

This project has been created to fulfill the requirement test as Backend Developer at Julo Company. The task is to create a REST API as docummented on this link: https://documenter.getpostman.com/view/8411283/SVfMSqA3?version=latest. This project was created using Node.js and PostgreSQL as database. 

## Step to run on Localhost

- Configure token secret key and database config on the ``.env`` file 
- Run ``npm install`` to install dependency from package.json file
- Create a new POSTGESQL database on local before running the migration
- Run ``npm run migrate up`` to create required tables in the database
- Insert some data to the **user_wallets** table before sending request from postman, for the query is simple like this : ``INSERT INTO user_wallets (id, owned_by, status, enabled_at, disabled_at, balance) VALUES ('ea0212d3-abd6-406f-8c67-868e814a2431', 'ea0212d3-abd6-406f-8c67-868e814a2436', 'enabled', '2023-09-04 18:43:15.000000', '2023-09-04 18:43:09.000000', 1000);``
- Run the project by ``node index`` or ``npm run dev``
- Open the postman and set the URL to ``http://localhost:port/api/v1/wallet`` or can import the postman file from this project as example
- Send request the endpoints on the postman

Thank you for reading this readme file!
