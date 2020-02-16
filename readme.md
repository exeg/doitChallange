# Challenge Application
This application works in 2 modes:

 - Load data from flat file to Mongo database.
 - Test framework to compare data in flat file with data in database.

## Installation
1. Install all dependencies - npm install or yarn install.
2. Create variables.env file in the root folder with DATABASE field with MongoDb address and start your Mongo database server.
3. Load data into testing database.
3. Start testing framework.

## Usage
To load data from flat file to database
```sh
$ node app -load FILENAME
```
To start test framework
```sh
$ node app -test FILENAME
```
Results of testing are visible on your terminal and stored in CSV file errorReport.
Have a nice day.
## History
1.0
## License
MIT license