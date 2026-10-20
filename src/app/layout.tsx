export const metadata = { title: "Helpdesk HQ", description: "The AI Agent Engineer course project" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "32px 24px", lineHeight: 1.6 }}>
        {children}
      </body>
    </html>
  );
}
