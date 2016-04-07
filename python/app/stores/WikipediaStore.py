from app.collections.WikipediaCollections import WikipediaCollections


class WikipediaStore:
    def __init__(self):
        self.collections = WikipediaCollections(None).getCollections()
        print('Collections', collections)

    def saveEntry(self, title, day, cateogory, time, year):
        if not title or not day or not cateogory
            print("Not enought arguments, incorrect insertion")
            return

        if year is not None:
            self.collections[cateogory].insert_one({
                'title': title,

            })
        else:
            pass
