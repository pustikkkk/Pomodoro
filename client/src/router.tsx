import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Verify } from '@/pages/Verify'
import { Dashboard } from '@/pages/Dashboard'
import { Create } from '@/pages/Create'
import { Edit } from '@/pages/Edit'
import { Focus } from '@/pages/Focus'

// ProtectedRoute wraps the authenticated area: it verifies the session via GET /auth/me
// and redirects to /login if unauthenticated.
export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/verify', element: <Verify /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/create', element: <Create /> },
      { path: '/edit/:id', element: <Edit /> },
      { path: '/focus/:id', element: <Focus /> },
    ],
  },
])
