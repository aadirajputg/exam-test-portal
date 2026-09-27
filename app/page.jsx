'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const EXAMS = [
  { slug: 'up-super-tet', name: 'UP Super TET 2026', badge: '12,405 पद', icon: '🎓' },
  { slug: 'ctet-uptet', name: 'CTET / UPTET', badge: 'Paper 1 & 2', icon: '📖' },
  { slug: 'up-police', name: 'UP Police Constable', badge: 'New Batch', icon: '👮' },
  { slug: 'upsssc-pet', name: 'UPSSSC PET', badge: 'PET 2026', icon: '🏛️' },
  { slug: 'ssc-gd', name: 'SSC GD Constable', badge: 'Mock Set', icon: '🎯' },
]

export default function Home() {
  const [selectedExam, setSelectedExam] = useState('up-super-tet')
  const [testData, setTestData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchTest() {
      setLoading(true)
      setSubmitted(false)
      setUserAnswers({})
      const { data } = await supabase
        .from('daily_tests')
        .select('*')
        .eq('exam_slug', selectedExam)
        .order('test_date', { ascending: false })
        .limit(1)
        .single()
      
      setTestData(data)
      setLoading(false)
    }
    fetchTest()
  }, [selectedExam])

  const handleSelectOption = (qIndex, oIndex) => {
    if (submitted) return
    setUserAnswers({ ...userAnswers, [qIndex]: oIndex })
  }

  const calculateScore = () => {
    if (!testData?.questions) return 0
    return testData.questions.reduce((score, q, idx) => {
      return userAnswers[idx] === q.correct_index ? score + 1 : score
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EXAMS.map((exam) => (
          <button
            key={exam.slug}
            onClick={() => setSelectedExam(exam.slug)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              selectedExam === exam.slug
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <span>{exam.icon}</span>
            <span>{exam.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">टेस्ट लोड हो रहा है...</div>
      ) : !testData ? (
        <div className="text-center py-12 bg-white rounded-2xl border p-6">
          <p className="text-slate-600">इस परीक्षा के लिए आज का टेस्ट अभी तैयार हो रहा है।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header & SEO Summary */}
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-2">
            <h1 className="text-xl font-bold text-slate-800">{testData.exam_title} - दैनिक अभ्यास सेट</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{testData.seo_summary}</p>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {testData.questions.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <span className="bg-blue-50 px-2 py-0.5 rounded">{q.subject}</span>
                  <span>•</span>
                  <span className="text-slate-500">{q.topic}</span>
                </div>
                <h3 className="font-semibold text-base text-slate-900 leading-snug">
                  {idx + 1}. {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    let btnStyle = "border-slate-200 hover:bg-slate-50 text-slate-700"
                    if (userAnswers[idx] === oIdx) {
                      btnStyle = "border-blue-600 bg-blue-50 text-blue-900 font-medium"
                    }
                    if (submitted) {
                      if (oIdx === q.correct_index) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium"
                      } else if (userAnswers[idx] === oIdx) {
                        btnStyle = "border-rose-500 bg-rose-50 text-rose-900"
                      }
                    }
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(idx, oIdx)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${btnStyle}`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </button>
                    )
                  })}
                </div>

                {submitted && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 mt-3 leading-relaxed">
                    <span className="font-bold">व्याख्या: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit / Score Bar */}
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
            >
              टेस्ट सबमिट करें (परिणाम देखें)
            </button>
          ) : (
            <div className="bg-blue-600 text-white p-6 rounded-2xl text-center space-y-2 shadow-xl">
              <h2 className="text-2xl font-black">आपका स्कोर: {calculateScore()} / {testData.questions.length}</h2>
              <p className="text-blue-100 text-sm">शानदार प्रयास! सभी प्रश्नों की व्याख्या ऊपर दी गई है।</p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setUserAnswers({})
                }}
                className="mt-3 bg-white text-blue-700 font-semibold px-6 py-2 rounded-xl text-sm hover:bg-blue-50"
              >
                दोबारा अभ्यास करें
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
