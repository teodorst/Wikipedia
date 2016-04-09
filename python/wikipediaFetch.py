import sys
import time
import mwclient
import os
import settings

from app.databases.database import Database
from app.stores.wikipediaStore import WikipediaStore
from wikipediaFetchThread import WikipediaFetchThread


class Month():
    def __init__(self, monthName, monthDays):
        self.monthName = monthName
        self.monthDays = monthDays

    def __str__(self):
        return "Luna %s are %d zile " %(self.monthName, self.monthDays)


def getTime():
    return int(round(time.time() * 1000))




class WikipediaFetcher:
    def __init__(self):
        self.months = [
            Month('January', 31), Month('February', 29), Month('March', 31), Month('April', 30),
            Month('May', 31), Month('June', 30), Month('July', 31), Month('August', 31),
            Month('September', 30), Month('October', 31), Month('November', 30), Month('December', 31)
        ]
        self.wikiClient = mwclient.Site('en.wikipedia.org', path='/w/')
        self.wikiStore = WikipediaStore()
        self.pages = []
        self.createPagesQueue()

    def createPagesQueue(self):
        for month in self.months:  # ok, got it. # hai cu compose-ul  masii
            for day in range(1, month.monthDays + 1):
                self.pages.append(month.monthName + '_' + str(day))

    def fetchDB(self):
        threads = []
        numThreads = 4
        pages = []
        time = getTime()

        print("Begin database fetching: ... ")
        for index in range(numThreads):
            thread = WikipediaFetchThread(index, numThreads, self.pages, self.wikiClient, self.wikiStore, time)
            threads.append(thread)
            thread.start()

        for index in range(numThreads):
            threads[index].join()

        print ((getTime() - time) / 1000)


if __name__ == "__main__":

    database = Database(None, None)

    # check if database has connect succesfully
    if (database.dbConnection['connect'] == False):
        print("Database connection ................ Failed")
        sys.exit(127)
    else:
        print("Database connection ................ Success")
        WikipediaFetcher().fetchDB()