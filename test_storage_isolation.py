import json, time, random, string

class LocalStorage:
    def __init__(self):
        self.store = {}
    def getItem(self, k):
        return self.store.get(k)
    def setItem(self, k, v):
        self.store[k] = v

pc = LocalStorage()
phone = LocalStorage()

# Create on PC
survey_id = 'survey_test_123'
pc.setItem('survey_meta_' + survey_id, json.dumps({
    'surveyId': survey_id, 'title': 'Test', 'submissionCount': 0}))
print("PC Created meta")

# Submit on phone
phone.setItem('survey_results_' + survey_id, json.dumps([{'id':1}]))
print("Phone submitted data")

# Admin on PC (no results)
meta = pc.getItem('survey_meta_' + survey_id)
results = pc.getItem('survey_results_' + survey_id)
print("\nOn PC:")
print("  meta exists:", bool(meta))
print("  results exists:", bool(results))
print("\nOn Phone:")
print("  results exists:", bool(phone.getItem('survey_results_' + survey_id)))

print("\nConclusion: Data is device/origin isolated. Must use same browser.")
