import { Inter, Newsreader } from 'next/font/google'

const body = Inter({ subsets: ['latin'], variable: '--sh-font-body', display: 'swap' })
const display = Newsreader({ subsets: ['latin'], variable: '--sh-font-display', display: 'swap' })

// Class names that define the font CSS variables on <html>
export const fontVariables = `${body.variable} ${display.variable}`