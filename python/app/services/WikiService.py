from app.stores.wikipediaStore import WikipediaStore


"""
    Layer over stores
    Offers an interface for rest api layer
    getData -> return data from store based on request query params
"""
class WikipediaService:
    def __init__(self):
        self.wikiStore = WikipediaStore()

    """
    @:param query params from request
    @return list of documents from store
    """
    def getData(self, day, year, category, keyword):
        if category is not None:
            return self.wikiStore.findInCategory(category, day, year, keyword)
        else:
            return self.wikiStore.findAll(day, year, keyword)


