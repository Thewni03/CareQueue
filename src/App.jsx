import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Book from './pages/Book.jsx'
import Appointments from './pages/Appointments.jsx'
import Medicine from './pages/Medicine.jsx'
import Counter from './pages/Counter.jsx'
import Schedule from './pages/Schedule.jsx'
import PharmacyStock from './pages/PharmacyStock.jsx'
import Admin from './pages/Admin.jsx'

function Guard({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book" element={<Book />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/appointments" element={<Guard roles={['PATIENT']}><Appointments /></Guard>} />
        <Route path="/counter" element={<Guard roles={['HOSPITAL']}><Counter /></Guard>} />
        <Route path="/schedule" element={<Guard roles={['HOSPITAL']}><Schedule /></Guard>} />
        <Route path="/stock" element={<Guard roles={['PHARMACY']}><PharmacyStock /></Guard>} />
        <Route path="/admin" element={<Guard roles={['ADMIN']}><Admin /></Guard>} />
        <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/book'} replace />} />
      </Route>
    </Routes>
  )
}
