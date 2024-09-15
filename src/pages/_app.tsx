import '../styles/globals.css'  
import { SessionProvider } from 'next-auth/react'  
import type { AppProps } from 'next/app'  
import { SpeedInsights } from "@vercel/speed-insights/next"

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {  
  return (  
    <SessionProvider session={session}> 
      <SpeedInsights/> 
      <Component {...pageProps} />  
    </SessionProvider>  
  )  
}  

export default MyApp