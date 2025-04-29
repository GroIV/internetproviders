import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import ProviderComparison from "./pages/ProviderComparison";
import CoverageMap from "./pages/CoverageMap";
import Resources from "./pages/Resources";
import AiAssistant from "./pages/AiAssistant";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home}/>
          <Route path="/compare" component={ProviderComparison}/>
          <Route path="/coverage" component={CoverageMap}/>
          <Route path="/resources" component={Resources}/>
          <Route path="/ai-assistant" component={AiAssistant}/>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
