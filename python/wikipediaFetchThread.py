from threading import Thread
import re


categories = ['events', 'births', 'deaths', 'holidaysandobservances']

class WikipediaFetchThread(Thread):
    def __init__(self, threadId, numThreads, pages, wikiClient, wikiStore, time ):
        Thread.__init__(self)
        self.threadId = threadId
        self.numThreads = numThreads
        self.pages = pages
        self.wikiClient = wikiClient
        self.wikiStore = wikiStore
        self.time = time
        self.setRegex()


    def setRegex(self):
        """
            regex variables
        """
        word = '\s*[\s\w]+\s*'
        linkYear = '\s*\[\[[0-9\sBC]+\]\]\s*'
        year = '\s*[0-9\sBC]+\s*'

        """
        main regex rules for lines
        """
        self.categoryRegexPattern = re.compile('==(' + word + ')==')
        self.entryRegexPattern = re.compile('\*(' + linkYear + '|' + year + ')&ndash;\s*')
        self.holidayRegexPattern = re.compile('(\*+)\s*')

        """
        convert lines to normal text by removing extra link description and brackets
        """
        self.removeDash = re.compile('&ndash')
        self.removeLinkDescription = re.compile('(\[[^\]]+\|)|(\{[^\}]+\|)')
        self.removeBrackets = re.compile('[\{\}\[\]\*]+')
        self.removeWhiteSpaces = re.compile('\s|(&nbsp;)')


    """ remove useless data from titles """
    def convertEntry(self, entry):
        return re.sub(
            self.removeDash,
            '-',
            re.sub(
                self.removeBrackets,
                '',
                re.sub(
                    self.removeLinkDescription,
                    '[[',
                    entry
                )
            )
        ).strip()

    def parseResponse(self,lines, day):
        currentCategory = None
        match = None
        for line in lines:

            match = self.categoryRegexPattern.match(line)

            #if it is a category
            if match is not None:
                readedCategory = re.sub(self.removeWhiteSpaces, '', match.group(1)).lower()
                if readedCategory in categories:
                    currentCategory = readedCategory
                else:
                    currentCategory = None

            else:
                if not currentCategory:
                    continue
                # if it's a category entry
                match = self.entryRegexPattern.match(line)

                if match is not None:
                    year = re.sub(self.removeBrackets, '', match.group(1)).strip()
                    title = self.convertEntry(line[match.span(0)[1]:])
                    self.wikiStore.saveEntry(title, day, currentCategory, self.time, year)

                else:
                    match = self.holidayRegexPattern.match(line)
                    if match is not None:
                        title = self.convertEntry(line[match.span(0)[1]:])
                        self.wikiStore.saveEntry(title, day, currentCategory, self.time, None)


    def run(self):
        # page = 'December_23'
        for index in range(self.threadId, len(self.pages),self.numThreads):
            page = self.pages[index]
            pageResponse = self.wikiClient.Pages[page].text()
            self.parseResponse(pageResponse.split('\n'), page)
            print("%s Completed" % page)