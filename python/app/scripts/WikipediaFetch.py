import mwclient
from threading import Thread
from app.stores.WikipediaStore import WikipediaStore
import time


class Month():
    def __init__(self, monthName, monthDays):
        self.monthName = monthName
        self.monthDays = monthDays

    def __str__(self):
        return "Luna %s are %d zile " %(self.monthName, self.monthDays)




#print months
# print site.Pages['March_13'].text()
# print site.Pages['March_13'].text()
# print site.Pages['March_13'].text()



def getTime():
    return int(round(time.time() * 1000))



class WikipediaFetchThread(Thread):
    def __init__(self, threadId, numThreads, pages, wikiClient, dbConnection):
        Thread.__init__(self)
        self.threadId = threadId
        self.pages = pages
        self.db = dbConnection
        self.numThreads = numThreads

    def run(self):
        page = 'March_13'
        # self.responseLines =

    def parseResponse(self):
        pass


    # for index in range(numThreads):
    #     thread = WikipediaFetchThread(index, numThreads, [], wikiClient, 0)
    #     threads.append(thread)
    #     thread.start()
    #
    # for index in range(numThreads):
    #     threads[index].join()
    #     print "Threadul %d a terminat" % index



class WikipediaFetcher:
    def __init__(self):
        self.months = [
            Month('January', 31), Month('February', 29), Month('March', 31), Month('April', 30),
            Month('May', 31), Month('June', 30), Month('July', 31), Month('August', 31),
            Month('September', 30), Month('October', 31), Month('November', 30), Month('December', 31)
        ]
        self.wikiClient = mwclient.Site('en.wikipedia.org', path='/w/')
        self.wikiStore = WikipediaStore()


    def fetchDB(self):
        threads = []
        numThreads = 8
        pages = []
        time = getTime()

        for month in self.months:  # ok, got it. # hai cu compose-ul  masii
            for day in range(1, month.monthDays + 1):
                pages.append(month.monthName + '_' + str(day))



        print(pages)
        print(len(pages))
        print(time)


if __name__ == "__main__":
    WikipediaFetcher().fetchDB()