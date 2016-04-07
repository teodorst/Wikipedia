import settings
import sys
from flask import Flask, jsonify

from app.databases.database import Database


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

        # Setting web server routes
        @app.route("/")
        def findWiki():
            f = {'message': 'salut'}
            response = jsonify(**f)
            response.status_code = 200
            return response

        app.run(host='0.0.0.0', port='3005')
