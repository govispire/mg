
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-8 bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="text-sm font-medium">PrepSmart</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <nav>
              <ul className="flex items-center gap-6">
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            
            <div className="text-sm text-gray-500">
              © 2025 PrepSmart. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
