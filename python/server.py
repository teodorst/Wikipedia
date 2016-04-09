import sys
from flask import Flask, jsonify, request, json, Response
from threading import Thread
import time
import os
import settings

from app.databases.database import Database
from wikipediaFetch import WikipediaFetcher
from app.services.WikiService import WikipediaService

WAITING_INTEVAL = 7200

# function called after database fetch is completed
def fetchCallback():
    print("Database fetch completed")

# fecth database and wait 7200 seconds
def fetchDB(fetcher):
    fetcher.fetchDB()
    while(True):
        time.sleep(WAITING_INTEVAL)
        fetcher.fetchDB()

if __name__ == "__main__":

    # create web server
    app = Flask(__name__)

    # connect to database
    database = Database(None, None)

    # check if database has connected succesfully
    if (database.dbConnection['connect'] == False):
        print("Database connection ................ Failed")
        sys.exit(127)
    else:
        print("Database connection ................ Success")

        fetcher = WikipediaFetcher()
        fetcherThread = Thread(target=fetchDB, args=(fetcher,))
        fetcherThread.start()

        wikipediaService = WikipediaService()

        # Setting web server routes
        @app.route("/")
        def findWiki():
            response = {}
            day = request.args.get('day')
            year = request.args.get('year')
            category = request.args.get('category')
            keyword = request.args.get('keyword')

            if category is not None:
                category = category.lower()

            response['results'] = wikipediaService.getData(day, year, category, keyword)

            # add on response number of found documents
            response['count'] = len(response['results'])
            response = jsonify(response)
            # verify if documents were found
            if response['count'] > 0:
                response.status_code = 200
            else:
                response.status_code = 404
            return response
        # listen on port 8080 from any host in local network
        app.run(threaded=True, host='0.0.0.0', port='8080', )
