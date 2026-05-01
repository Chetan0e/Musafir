import Navbar from './Navbar';
import AIGuide from './AIGuide';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-4">
        {children}
      </main>
      <AIGuide />
    </div>
  );
}
