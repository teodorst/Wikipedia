from pymongo import MongoClient
import os



class Database:

    class __Database:
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
            self.wikiCollections = {
                'events': self.dbConnection['EventsCollection'],
                'births': self.dbConnection['BirthsCollection'],
                'deaths': self.dbConnection['DeathsCollection'],
                'holidaysandobservances': self.dbConnection['Holidaysandobservances']
            }

    instance = None

    def __new__(self, dbUrl, dbName):
        if not Database.instance:
            print('aici')
            Database.instance = Database.__Database(dbUrl, dbName)
            print(Database.instance.dbConnection)
        return Database.instance

    def __getattr__(self, item):
        return getattr(self.instance, item)

    def __setattr__(self, key, value):
        return setattr(self.instance, key, value)





