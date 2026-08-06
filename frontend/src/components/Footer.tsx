'use client';

export default function Footer() {
  return (
    <footer className="bg-sidebar-bg text-sidebar-text py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">&copy; {new Date().getFullYear()} Todo List App. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-sidebar-text/70">
          <span>Built with Next.js</span>
          <span className="text-sidebar-text/40">|</span>
          <span>Symfony Backend</span>
        </div>
      </div>
    </footer>
  );
}
