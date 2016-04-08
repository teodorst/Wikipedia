from app.databases.database import Database


def createQueryObject(day, year, keyword):
    queryObject = {}
    if day is not None:
        queryObject['day'] = day

    if year is not None:
        queryObject['year'] = year


    if keyword is not None:
        queryObject['title'] = { '$regex' : keyword }

    return queryObject


def convertId(document):
    document['_id'] = str(document['_id'])
    return document

class WikipediaStore:
    def __init__(self):
        self.collections = Database(None, None).wikiCollections

    def __str__(self):
        print(self.collections)

    def saveEntry(self, title, day, category, time, year):
        if not title or not day or not category:
            return None
        result = None
        if year is not None:
            result = self.collections[category].update_one(
                {
                    'title': title,
                    'category': category
                },
                {
                    '$set' : {
                        'title': title,
                        'day': day,
                        'year': year,
                        'category': category,
                        'updated': time
                    }
                },
                True  #upsert set to true
            )
        else:
            result = self.collections['holidaysandobservances'].update_one(
                {
                    'title': title,
                    'category': category
                },
                {
                    '$set': {
                        'title': title,
                        'day': day,
                        'year': year,
                        'category': category,
                        'updated': time
                    }
                },
                True  # upsert set to true
            )

        if result.acknowledged == True:
            if result.matched_count > 0 and result.modified_count > 0:
                return None
            elif result.matched_count == 0 and result.upserted_id:
                return result.upserted_id
            else:
                return None

    def findInCategory(self, category, day, year, keyword):
        results = []
        queryObj = createQueryObject(day, year, keyword)
        if category == 'holidaysandobservances':
            del queryObj['year']
        return list(map(convertId, [doc for doc in self.collections[category].find(queryObj)]))



    def findAll(self, day, year, keyword):
        result = []
        queryObj = createQueryObject(day, year, keyword)
        for category in self.collections:
            if category != 'holidaysandobservances':
                result += list(map(convertId, [doc for doc in self.collections[category].find(queryObj)]))
            else:
                queryObj2 = queryObj.copy()
                del queryObj2['year']
                result += list(map(convertId, [doc for doc in self.collections[category].find(queryObj)]))
        return result
