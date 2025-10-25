import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function Layout() {
  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-6 overflow-hidden">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
