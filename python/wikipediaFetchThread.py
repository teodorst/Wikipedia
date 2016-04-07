from threading import Thread
import re

class WikipediaFetchThread(Thread):
    def __init__(self, threadId, numThreads, pages, wikiClient, dbConnection):
        Thread.__init__(self)
        self.db = dbConnection
        self.threadId = threadId
        self.numThreads = numThreads
        self.pages = pages
        self.wikiClient = wikiClient

    def run(self):
        page = 'March_13'
        pageResponse = self.wikiClient.Pages[page].text()
        self.parseResponse(pageResponse.split('\n'))



    def parseResponse(self,lines):
        
        pass




