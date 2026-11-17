import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-line mt-20 py-10 px-6 text-center text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gradient">
          © 2026 Frontend Arsenal. Built under Owner's Strict Monochrome Design Lock.
        </p>
        <div className="flex gap-6">
          <span className="text-gradient font-bold">Bell MT Typography</span>
          <span className="text-gradient font-bold">Three-Color Gradient</span>
          <span className="text-gradient font-bold">Zero-Config Mock Engine</span>
        </div>
      </div>
    </footer>
  );
}

