'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <a className="text-lg font-bold">MyApp</a>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/">
              <a className="text-sm font-medium hover:text-gray-300">Home</a>
            </Link>
            <Link href="/about">
              <a className="text-sm font-medium hover:text-gray-300">About</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm font-medium hover:text-gray-300">Contact</a>
            </Link>
          </nav>
          {/* Mobile Menu (Optional) */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open menu"
            >
              {/* Add a hamburger icon or menu toggle logic here */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
