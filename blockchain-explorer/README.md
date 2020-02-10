# Install Postgre
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

cd blockchain-explorer/app

cd blockchain-explorer/app/persistence/fabric/postgreSQL
chmod -R 775 db/

# Run create database script.

cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
./createdb.sh
sudo -u postgres psql

# Start
cd blockchain-explorer
npm install
cd blockchain-explorer/app/test
npm install
npm run test
cd client/
npm install
npm test -- -u --coverage
npm run build

cd blockchain-explorer/
./start.sh

#Now, you can open Hyperledger Explorer on your browser.
http://localhost:8080

