import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import Nav from 'components/nav'
import 'mapbox-gl/dist/mapbox-gl.css';
import { BadgeProvider } from '@/components/BadgeContext';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-pink-100 bg-opacity-50 min-h-screen">
      <BadgeProvider>
        <Nav />
        <Component {...pageProps} />
      </BadgeProvider>
    </div>
  )
}
export default MyApp
