import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const ProviderComparison = lazy(() => import("./pages/ProviderComparison"));
const CoverageMap = lazy(() => import("./pages/CoverageMap"));
const Resources = lazy(() => import("./pages/Resources"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const NotFound = lazy(() => import("./pages/not-found"));

// Loading component with skeleton
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-2xl px-4">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  </div>
);

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Switch>
            <Route path="/" component={Home}/>
            <Route path="/compare" component={ProviderComparison}/>
            <Route path="/coverage" component={CoverageMap}/>
            <Route path="/resources/:id" component={BlogPost}/>
            <Route path="/resources" component={Resources}/>
            <Route path="/ai-assistant" component={AiAssistant}/>
            <Route path="/login" component={Login}/>
            <Route path="/signup" component={Signup}/>
            <Route path="/admin" component={AdminDashboard}/>
            <Route component={NotFound} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;