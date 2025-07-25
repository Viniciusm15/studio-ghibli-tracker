import "./globals.css";

export const metadata = {
  title: 'Studio Ghibli Tracker',
  description: 'Acompanhe seus filmes do Studio Ghibli',
}
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
