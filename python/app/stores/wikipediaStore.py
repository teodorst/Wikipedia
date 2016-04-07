from app.databases.database import Database


class WikipediaStore:
    def __init__(self):
        self.collections = Database(None, None).wikiCollections
        print('Collections', self.collections)

    def saveEntry(self, title, day, category, time, year):
        if not title or not day or not category:
            print("Not enought arguments, incorrect insertion")
            return
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
                print('Updated successfully')
                print(result.raw_result)
                return None
            elif result.matched_count == 0 and result.upserted_id:
                print("Insert Succesfully")
                return result.upserted_id
            else:
                print('Updated failed')
                return None