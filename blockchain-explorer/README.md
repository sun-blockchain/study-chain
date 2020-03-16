### 1. Set up PostgreSQL

```bash
cd blockchain-explorer/app/persistent/fabric/postgreSQL
chmod -R 777 db/
cd db
./createdb.sh
```

### 2. Start Explorer

```bash
cd blockchain-explorer
rm -r wallet/study-chain/
rm -f logs/console/console.log
npm install
./start.sh
```

### 3. Start Client

```bash
cd blockchain-explorer/client
npm run build
```

Access http://localhost:9000/

### 4. Stop Explorer

```bash
cd blockchain-explorer
./stop.sh
```
