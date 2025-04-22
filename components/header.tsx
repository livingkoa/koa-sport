import { Menu } from "lucide-react"

export default function Header() {
  return (
    <header className="py-6 flex justify-between items-center">
      <div className="font-bold text-xl">BRAND</div>
      <nav className="hidden md:block">
        <ul className="flex space-x-8">
          <li>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Products
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600 transition-colors">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </nav>
      <button className="md:hidden" aria-label="Menu">
        <Menu size={24} />
      </button>
    </header>
  )
}
