import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/plus-jakarta-sans'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF0] p-6 text-center font-sans">
          <div className="max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-100 text-[#B42318]">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="mt-4 text-20 font-extrabold text-[#111827]">Terjadi Kendala pada Halaman</h1>
            <p className="mt-2 text-13 text-[#6B7280] leading-relaxed">
              {this.state.error?.message || 'Aplikasi mengalami kesalahan saat memuat tampilan.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#346739] px-6 text-14 font-bold text-white transition-opacity hover:opacity-95"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
