WikipediaWebServer: Python vs Nodejs
============================
Nodejs
===============

### Nodejs dotenv(.env) file example:
###### for more info read mongodb database [connection](https://docs.mongodb.org/manual/reference/connection-string/)
```
DB_URL="mongodb://localhost:27017/Wikipedia"
PORT=8080
```

## Install nodejs version
###### Run nodejs server (without docker-compose) :
```
cd nodejs && npm install
```
```
npm start
```

#### For running the nodejs wikipedia server run (with docker-compose) :
```
sudo docker-compose up
```

###### Database fetch scripts can be found : nodejs/app/scripts

Python
====================

### Python dotenv(.env) file example:
###### for more info read mongodb database [connection](https://docs.mongodb.org/manual/reference/connection-string/)

```
DB_URL="mongodb://localhost:27017"
DB_NAME="Wikipedia"
PORT=8080
```

## Install python version
##### Run python server (without docker-compose) :
```
cd python && sudo pip install -r requirements.txt
```
```
python3.4 server.py
```

For running the nodejs wikipedia server run (with docker-compose) :
```
sudo docker-compose up
```



###### Database fetch script can be found : python/


Wikipedia Web Server
==============
