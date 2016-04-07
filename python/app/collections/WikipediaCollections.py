class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class WikipediaCollections():
    __metaclass__ = Singleton
    def __init__(self, dbConnection):
        if dbConnection and dbConnection['connect']:
            self.collections = {
                'events' : dbConnection['EventsCollection'],
                'births' : dbConnection['BirthsCollection'],
                'deaths' : dbConnection['DeathsCollection'],
                'holidaysandobservances' : dbConnection['Holidaysandobservances']
            }
        else:
            self.collections = {}

    def getCollections(self):
        return self.collections

