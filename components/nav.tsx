import { Soup, Settings, CircleUserRound } from "lucide-react"

export default function Nav() {
  return (
    <nav className="flex w-full mx-auto py-3 justify-between px-6" style={{ backgroundColor: "#003049" }}>
      <div className="flex items-center">
        <a href="/">
          <Soup className="w-6 h-6 text-white" />
        </a>
      </div>
      <ul className="flex gap-8 items-center text-white text-sm">
        <li><a href="/" className="hover:text-gray-300">Home</a></li>
        <li><a href="/itinerary" className="hover:text-gray-300">Itinerary</a></li>
        <li>
          <a href="/login" className="hover:text-gray-300">
            <Settings className="w-5 h-5 text-white" />
          </a>
        </li>
        <li>
          <a href="/login" className="hover:text-gray-300">
            <CircleUserRound className="w-5 h-5 text-white" />
          </a>
        </li>
      </ul>
    </nav>
  )
}