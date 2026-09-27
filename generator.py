import os
import json
import time
from datetime import date
from google import genai
from google.genai import types
from supabase import create_client

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

ai = genai.Client(api_key=GEMINI_KEY)
db = create_client(SUPABASE_URL, SUPABASE_KEY)

EXAMS = [
    {
        "slug": "up-super-tet",
        "title": "UP Primary Teacher (Super TET)",
        "scope": "UP D.El.Ed / BTC स्तर के बाल विकास, शिक्षण कौशल, सामान्य हिंदी, बेसिक गणित और पर्यावरण।"
    },
    {
        "slug": "ctet-uptet",
        "title": "CTET / UPTET Paper 1 & 2",
        "scope": "NCTE पाठ्यक्रमानुसार CDP, पेडागॉजी, हिंदी व्याकरण, पर्यावरण अध्ययन।"
    },
    {
        "slug": "up-police",
        "title": "UP Police Constable / SI",
        "scope": "उत्तर प्रदेश पुलिस भर्ती बोर्ड सिलेबस: सामान्य हिंदी, यूपी सामान्य ज्ञान, मानसिक अभिरुचि।"
    },
    {
        "slug": "upsssc-pet",
        "title": "UPSSSC PET",
        "scope": "आयोग के आधिकारिक 15 विषय: भारतीय इतिहास, भूगोल, भारतीय अर्थव्यवस्था, सामान्य विज्ञान, हिंदी।"
    },
    {
        "slug": "ssc-gd",
        "title": "SSC GD Constable",
        "scope": "स्टाफ सिलेक्शन कमीशन मैट्रिक स्तर: सामान्य बुद्धिमत्ता, सामान्य ज्ञान, प्रारंभिक गणित, हिंदी।"
    }
]

def generate_humanized_test(exam):
    prompt = f"""
आप भारत के एक वरिष्ठ सरकारी परीक्षा विशेषज्ञ और शिक्षक हैं।
परीक्षा: {exam['title']}
पाठ्यक्रम दायरा: {exam['scope']}

आपको आज के अभ्यास हेतु 10 अत्यंत महत्वपूर्ण बहुविकल्पीय प्रश्न (MCQs) और 1 संक्षिप्त परीक्षा विश्लेषण तैयार करना है।

दिशानिर्देश (Quality & Humanization):
1. भाषा स्वाभाविक, स्पष्ट और प्रामाणिक हिंदी (देवनागरी) होनी चाहिए। किताबी या मशीनी अनुवाद न लगे।
2. हर प्रश्न के 'explanation' में केवल सही उत्तर का कारण न लिखें, बल्कि उससे जुड़े 2 महत्वपूर्ण अतिरिक्त तथ्य भी जोड़ें ताकि छात्र को नया ज्ञान मिले (High Value Content for SEO)।
3. 'seo_summary' में आज के मॉक टेस्ट का एक स्वाभाविक 100-120 शब्दों का सारांश लिखें जिसमें परीक्षा तैयारी के टिप्स शामिल हों।

Output strictly in JSON format matching this schema:
{{
  "seo_summary": "आज के इस अभ्यास सेट में...",
  "questions": [
    {{
      "subject": "विषय का नाम",
      "topic": "टॉपिक का नाम",
      "question": "प्रश्न यहाँ लिखें?",
      "options": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"],
      "correct_index": 0,
      "explanation": "विस्तृत व प्रामाणिक व्याख्या..."
    }}
  ]
}}
"""
    try:
        response = ai.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text)
        
        db.table("daily_tests").upsert({
            "exam_slug": exam["slug"],
            "exam_title": exam["title"],
            "test_date": str(date.today()),
            "seo_summary": data.get("seo_summary", ""),
            "questions": data["questions"]
        }).execute()
        print(f"✓ {exam['title']} टेस्ट सफलतापूर्वक सेव हुआ।")
    except Exception as e:
        print(f"✗ एरर ({exam['slug']}): {e}")

if __name__ == "__main__":
    for item in EXAMS:
        generate_humanized_test(item)
        time.sleep(2)
