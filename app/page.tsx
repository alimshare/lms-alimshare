import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl text-gray-900">AlimShare LMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
          <span>🌙</span> Platform Pembelajaran Islam Terpadu
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Belajar &amp; Berbagi
          <span className="text-indigo-600"> Ilmu</span>
          <br />dengan Mudah
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Platform LMS modern untuk guru, siswa, dan administrator. Buat kursus, ikuti pembelajaran, dan raih sertifikat.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg"
          >
            Mulai Belajar Gratis
          </Link>
          <Link
            href="/courses"
            className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors text-lg"
          >
            Lihat Kursus
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🛡️', title: 'Administrator', desc: 'Kelola pengguna, kursus, dan konfigurasi sistem secara menyeluruh.' },
            { icon: '📖', title: 'Pengajar', desc: 'Buat kursus berkualitas, kelola kuis, dan pantau kemajuan siswa.' },
            { icon: '🎒', title: 'Siswa', desc: 'Daftar kursus, belajar mandiri, dan raih sertifikat kelulusan.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
