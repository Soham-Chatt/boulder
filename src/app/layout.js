import '../index.css'

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
      <head>
        {/* Runs synchronously before React mounts — prevents theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-bs-theme',d?'dark':'light');}catch(e){}})();` }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

