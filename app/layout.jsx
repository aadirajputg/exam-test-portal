import './globals.css'

export const metadata = {
  title: 'Daily Exam Practice Portal - मुफ़्त ऑनलाइन मॉक टेस्ट 2026',
  description: 'UP Super TET, UP Police, CTET, UPSSSC PET और SSC GD के लिए दैनिक मुफ़्त मॉक टेस्ट और विस्तृत हल।',
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="bg-slate-50 min-h-screen text-slate-900 font-sans">
        <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="font-bold text-xl tracking-tight">🎯 ExamPrep 2026</a>
            <span className="text-xs bg-blue-800 px-2.5 py-1 rounded-full font-medium">Daily Free Tests</span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4">{children}</main>
        <footer className="text-center text-xs text-slate-500 py-6 border-t mt-12 bg-white">
          <p>© 2026 ExamPrep Portal. सभी मॉक टेस्ट केवल शैक्षणिक अभ्यास हेतु हैं।</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
