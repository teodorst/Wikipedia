from app.stores.wikipediaStore import WikipediaStore


class WikipediaService:
    def __init__(self):
        self.wikiStore = WikipediaStore()
        print('Wikistore', self.wikiStore)


