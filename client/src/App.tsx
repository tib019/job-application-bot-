import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import CVManagement from "./pages/CVManagement";
import SearchConfig from "./pages/SearchConfig";
import { Button } from "./components/ui/button";
import { Home, Briefcase, FileText, Upload, Settings } from "lucide-react";

function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="text-xl font-bold text-gray-900 hover:text-gray-700">
                Job Application Bot
              </a>
            </Link>
            <div className="flex space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Stellen
                </Button>
              </Link>
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bewerbungen
                </Button>
              </Link>
              <Link href="/cvs">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  CVs
                </Button>
              </Link>
              <Link href="/search-config">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Konfiguration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/applications" component={Applications} />
        <Route path="/cvs" component={CVManagement} />
        <Route path="/search-config" component={SearchConfig} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
