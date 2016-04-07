import settings
from flask import Flask, jsonify
from app.stores.DataBase import Database
import app.services.WikiService
import sys


#connect to database


# # print collections
# print(collections)


# result = collections['events'].insert_one({
#     'a' : '2'
# })
#
# print(result.inserted_id)
#
# result = collections['deaths'].insert_one({
#     'a' : '2'
# })

# print(result.inserted_id)


if __name__ == "__main__":

    app = Flask(__name__)
    database = Database(None, None)

    print(database.dbConnection['Wikipedia'])

    # check if database has connect succesfully
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
