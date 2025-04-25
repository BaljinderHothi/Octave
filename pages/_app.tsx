import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import Nav from 'components/nav'
import 'mapbox-gl/dist/mapbox-gl.css';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Nav />
      <Component {...pageProps} />
    </>
  )
}
export default MyApp
