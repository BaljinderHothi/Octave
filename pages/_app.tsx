import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import Nav from 'components/nav'
import 'mapbox-gl/dist/mapbox-gl.css';
import { BadgeProvider } from '@/components/BadgeContext';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BadgeProvider>
      <Nav />
      <Component {...pageProps} />
    </BadgeProvider>
  )
}
export default MyApp
