import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      <Header title={title} />
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
