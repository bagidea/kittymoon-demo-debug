import {
    ChakraProvider,
    extendTheme
} from "@chakra-ui/react"

import Head from "next/head"

const theme = extendTheme()

const App = ( { Component, pageProps } ) => (
    <ChakraProvider
        theme={ theme }
    >
        <Head>
            <link rel="icon" type="image/png" href="/icon.png" />
        </Head>

        <Component { ...pageProps } />
    </ChakraProvider>
)

export default App