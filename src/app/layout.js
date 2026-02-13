import '../index.css'
import 'leaflet/dist/leaflet.css'

export const metadata = {
  title: 'Boulderhallen',
  description: 'Een lijst van boulderhallen door heel Nederland',
}

export const viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#212529', color: 'white' }}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

