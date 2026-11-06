import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Logo from './components/ui/Logo.jsx'
import SiteHeader from './components/ui/SiteHeader.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminVerification from './pages/admin/AdminVerification.jsx'
import Beranda from './pages/Beranda.jsx'
import DaftarDonatur from './pages/DaftarDonatur.jsx'

export default function App() {
  const location = useLocation()
  const isAdminRoute =
    location.pathname.startsWith('/admin') || location.pathname === '/login'

  return (
    <div className="flex min-h-dvh flex-col font-sans">
      {!isAdminRoute && <SiteHeader />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/donatur" element={<DaftarDonatur />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/verifikasi" replace />} />
          <Route path="/admin/verifikasi" element={<AdminVerification />} />
          {/* Path yang tidak dikenal dikembalikan ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && (
        <footer className="border-t border-[#C8D9BF] bg-[#FDFBF0] px-6 py-6 text-center text-13 text-[#6B7280]">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo />
            <p className="font-medium text-[#4B5563]">
              © 2026 KasihBersama. Setiap kebaikan tercatat.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
