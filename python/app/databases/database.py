from pymongo import MongoClient, ASCENDING
import os



class Database:

    class __Database:
        def __init__(self, dbUrl, dbName):
            url = dbUrl
            name = dbName
            if not url:
                url = os.environ['DB_URL']

            # only for docker
            if os.environ['DB_PORT']:
                url = os.environ['DB_PORT'].replace('tcp', 'mongodb')

            print(url)


            if not name:
                name = os.environ['DB_NAME'] and "Wikipedia"


            self.dbConnection = MongoClient(url)[name]
            self.wikiCollections = {
                'events': self.dbConnection['EventsCollection'],
                'births': self.dbConnection['BirthsCollection'],
                'deaths': self.dbConnection['DeathsCollection'],
                'holidaysandobservances': self.dbConnection['Holidaysandobservances']
            }
            self.wikiCollections['events'].create_index([('title', ASCENDING)], unique=True)
            self.wikiCollections['births'].create_index([('title', ASCENDING)], unique=True)
            self.wikiCollections['deaths'].create_index([('title', ASCENDING)], unique=True)
            self.wikiCollections['holidaysandobservances'].create_index([('title', ASCENDING)], unique=True)

    instance = None

    def __new__(self, dbUrl, dbName):
        if not Database.instance:
            Database.instance = Database.__Database(dbUrl, dbName)
        return Database.instance

    def __getattr__(self, item):
        return getattr(self.instance, item)

    def __setattr__(self, key, value):
        return setattr(self.instance, key, value)




