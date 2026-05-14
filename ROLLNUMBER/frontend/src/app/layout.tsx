import type { Metadata } from 'next';
import './globals.css';
import ThemeProviderWrapper from '../components/ThemeProviderWrapper';
import ClientLayoutShell from '../components/ClientLayoutShell';

export const metadata: Metadata = {
  title: 'CampusHub Notification Center',
  description: 'Next-generation real-time prioritized notification system for students and academic staff.',
  keywords: ['notifications', 'priority queue', 'campus life', 'real-time'],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderWrapper>
          {/* 
            Since Layout structure maintains user state (socket link, drawer toggle),
            we move the UI shell to ClientLayoutShell client wrapper.
          */}
          <ClientLayoutShell>
            {children}
          </ClientLayoutShell>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
