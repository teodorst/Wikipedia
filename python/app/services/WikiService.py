from app.stores.WikipediaStore import WikipediaStore


class WikipediaService:
    def __init__(self):
        self.wikiStore = WikipediaStore()
        print('Wikistore', self.wikiStore)


