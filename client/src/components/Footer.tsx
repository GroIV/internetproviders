import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shadow-lg">
                <i className="ri-wifi-line text-white text-xl"></i>
              </div>
              <span className="ml-3 text-xl font-display font-bold text-white">
                InternetProviders<span className="text-primary-500">.ai</span>
              </span>
            </Link>
            <p className="mt-4 text-sm">
              The AI-powered platform that helps you find the perfect internet provider based on your unique needs and location.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/resources" className="text-neutral-400 hover:text-white">Guides</Link></li>
              <li><Link href="/resources" className="text-neutral-400 hover:text-white">Blog</Link></li>
              <li><Link href="/coverage" className="text-neutral-400 hover:text-white">Speed Test</Link></li>
              <li><Link href="/coverage" className="text-neutral-400 hover:text-white">Coverage Map</Link></li>
              <li><Link href="/compare" className="text-neutral-400 hover:text-white">Provider Reviews</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Press</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Partners</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Accessibility</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white">Do Not Sell My Info</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col items-center">
          <p className="text-sm text-neutral-500 text-center">
            © {new Date().getFullYear()} InternetProviders.ai - All rights reserved. InternetProviders.ai is not affiliated with any internet service provider.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
