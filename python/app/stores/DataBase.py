from pymongo import MongoClient
import os
from app.collections.WikipediaCollections import WikipediaCollections

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class Database:
    __metaclass__ = Singleton

    def __init__(self, dbUrl, dbName):
        print("hai noroc")
        url = dbUrl
        name = dbName
        if not url:
            url = os.environ['DB_URL']
        print(url)

        if not name:
            name = os.environ['DB_NAME']
        self.dbConnection = MongoClient(dbUrl)[name]
        collections = WikipediaCollections(self.dbConnection)
        print(self.dbConnection)
        print(collections)

    def getDBConnection(self):
        return self.dbConnection







