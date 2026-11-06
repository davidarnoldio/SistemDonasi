import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cx } from '../../lib/cx.js'
import Logo from './Logo.jsx'

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#C8D9BF] bg-[#FDFBF0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          to="/"
          className="rounded-lg transition-transform hover:scale-[1.01]"
          aria-label="Beranda KasihBersama"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cx(
                'text-14 font-semibold transition-colors',
                isActive ? 'text-[#346739]' : 'text-[#6B7280] hover:text-[#111827]',
              )
            }
          >
            Beranda
          </NavLink>
          <a
            href="/#kampanye"
            className="text-14 font-semibold text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            Kampanye
          </a>
          <NavLink
            to="/donatur"
            className={({ isActive }) =>
              cx(
                'text-14 font-semibold transition-colors',
                isActive ? 'text-[#346739]' : 'text-[#6B7280] hover:text-[#111827]',
              )
            }
          >
            Daftar Donatur
          </NavLink>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-lg border border-[#C8D9BF] text-[#6B7280] md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#C8D9BF] bg-[#FDFBF0] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cx('text-14 font-semibold py-1', isActive ? 'text-[#346739]' : 'text-[#6B7280]')
              }
            >
              Beranda
            </NavLink>
            <a
              href="/#kampanye"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-14 font-semibold text-[#6B7280]"
            >
              Kampanye
            </a>
            <NavLink
              to="/donatur"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cx('text-14 font-semibold py-1', isActive ? 'text-[#346739]' : 'text-[#6B7280]')
              }
            >
              Daftar Donatur
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
