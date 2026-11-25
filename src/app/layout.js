import '../index.css'

export const metadata = {
  title: 'Boulderhallen',
  description: 'Alle boulderhallen van Nederland — every bouldering gym in the Netherlands',
}

export const viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* Site ships its own dark mode; stop Dark Reader from overriding it */}
        <meta name="darkreader-lock" />
        {/* Runs synchronously before React mounts — prevents theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-bs-theme',d?'dark':'light');}catch(e){}try{var l=localStorage.getItem('lang');if(l!=='nl'&&l!=='en'){var ls=navigator.languages||[navigator.language||'en'];l='en';for(var i=0;i<ls.length;i++){var c=(ls[i]||'').slice(0,2).toLowerCase();if(c==='nl'||c==='en'){l=c;break;}}}document.documentElement.lang=l;}catch(e){}})();` }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

