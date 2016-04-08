import sys
from flask import Flask, jsonify, request, json, Response
from threading import Thread
import time
import os
import settings

from app.databases.database import Database
from wikipediaFetch import WikipediaFetcher
from app.services.WikiService import WikipediaService

def fetchCallback():
    print("Database fetch completed")


def fetchDB(fetcher):
    fetcher.fetchDB()
    while(True):
        time.sleep(7200)
        fetcher.fetchDB()

if __name__ == "__main__":

    #doamne ajuta
    print(os.environ)

    # create web server
    app = Flask(__name__)

    # connect to database
    database = Database(None, None )

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
            count = len(response['results'])
            response['count'] = count
            response = jsonify(response)
            if count > 0:
                response.status_code = 200
            else:
                response.status_code = 404
            return response
        app.run(threaded=True, host='0.0.0.0', port='8080', )



