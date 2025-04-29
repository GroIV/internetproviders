import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [_, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Features", path: "/#features" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "Compare Plans", path: "/compare" },
    { name: "Coverage Map", path: "/coverage" },
    { name: "Resources", path: "/resources" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center shadow-lg">
                <i className="ri-wifi-line text-white text-xl"></i>
              </div>
              <span className="ml-3 text-xl font-display font-bold">
                InternetProviders<span className="text-primary-500">.ai</span>
              </span>
            </Link>
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-secondary-600 dark:hover:text-secondary-400 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  onClick={(e) => {
                    if (item.path.startsWith('/#')) {
                      e.preventDefault();
                      setLocation('/');
                      // Wait for the navigation to complete, then scroll to the hash
                      setTimeout(() => {
                        const id = item.path.split('#')[1];
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/ai-assistant">
              <Button className="hidden md:inline-flex items-center gradient-bg hover:opacity-90">
                <i className="ri-chat-1-line mr-2"></i>
                AI Assistant
              </Button>
            </Link>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-8 flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.path}
                      className="text-neutral-600 dark:text-neutral-300 hover:text-secondary-600 dark:hover:text-secondary-400 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={(e) => {
                        closeMenu();
                        if (item.path.startsWith('/#')) {
                          e.preventDefault();
                          setLocation('/');
                          // Wait for the navigation to complete, then scroll to the hash
                          setTimeout(() => {
                            const id = item.path.split('#')[1];
                            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Link href="/ai-assistant" onClick={closeMenu}>
                    <Button className="w-full gradient-bg hover:opacity-90">
                      <i className="ri-chat-1-line mr-2"></i>
                      AI Assistant
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
