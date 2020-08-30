import type { AppProps } from 'next/app'
import '../src/app/globals.css'
import Meta from '../src/app/Meta'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Meta />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
