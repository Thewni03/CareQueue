import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useAuth } from './auth.jsx'
import Accessibility from './components/Accessibility.jsx'
import Layout from './components/Layout.jsx'
import About from './pages/About.jsx'
import Admin from './pages/Admin.jsx'
import Appointments from './pages/Appointments.jsx'
import Book from './pages/Book.jsx'
import Contact from './pages/Contact.jsx'
import Counter from './pages/Counter.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Medicine from './pages/Medicine.jsx'
import PharmacyStock from './pages/PharmacyStock.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import Schedule from './pages/Schedule.jsx'

const ALL = ['PATIENT', 'HOSPITAL', 'PHARMACY', 'ADMIN']

function Guard({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={user && user.role !== 'PATIENT' ? <Navigate to={homeFor(user.role)} replace /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book" element={<Book />} />
          <Route path="/medicine" element={<Medicine />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Guard roles={ALL}><Profile /></Guard>} />
          <Route path="/appointments" element={<Guard roles={['PATIENT']}><Appointments /></Guard>} />
          <Route path="/counter" element={<Guard roles={['HOSPITAL']}><Counter /></Guard>} />
          <Route path="/schedule" element={<Guard roles={['HOSPITAL']}><Schedule /></Guard>} />
          <Route path="/stock" element={<Guard roles={['PHARMACY']}><PharmacyStock /></Guard>} />
          <Route path="/admin" element={<Guard roles={['ADMIN']}><Admin /></Guard>} />
          <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/'} replace />} />
        </Route>
      </Routes>
      <Accessibility />
    </>
  )
}