import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
