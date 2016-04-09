WikipediaWebServer: Python vs Nodejs
============================

## Install nodejs version
For the nodejs wikipedia server, run (without docker-compose) :
```
cd nodejs && npm install
```
```
npm start
```

For running the nodejs wikipedia server run (with docker-compose) :
```
sudo docker-compose up
```

##### Database fetch script can be found : nodejs/app/services


## Install python version
For the python wikipedia server, run (without docker-compose) :
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
##### Database fetch script can be found : python/


Wikipedia Web Server
==============
