import React from 'react'

import Navbar from "@/components/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">SmartEstate</h3>
            <p className="text-slate-400 max-w-sm">
              Discover your perfect home with SmartEstate. We provide a seamless experience for buying, selling, and renting properties.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/search" className="hover:text-white transition-colors">Search Houses</a></li>
              <li><a href="/agents" className="hover:text-white transition-colors">Find Agents</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              <li><a href="/signup" className="hover:text-white transition-colors">Sign Up</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SmartEstate AI Powered. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
