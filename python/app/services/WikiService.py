from app.stores.wikipediaStore import WikipediaStore



class WikipediaService:
    def __init__(self):
        self.wikiStore = WikipediaStore()


    def getData(self, day, year, category, keyword):
        if category is not None:
            return self.wikiStore.findInCategory(category, day, year, keyword)
        else:
            return self.wikiStore.findAll(day, year, keyword)

