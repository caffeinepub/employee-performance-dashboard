import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "./components/Header";
import { type Module, Sidebar } from "./components/Sidebar";
import Dashboard from "./modules/Dashboard";
import EmployeeProfile from "./modules/EmployeeProfile";
import Employees from "./modules/Employees";
import Feedback from "./modules/Feedback";
import SalesTrends from "./modules/SalesTrends";
import { Settings } from "./modules/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppContent() {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [selectedFiplCode, setSelectedFiplCode] = useState<string | null>(null);

  const handleNavigate = (mod: Module) => {
    setActiveModule(mod);
    setSelectedFiplCode(null);
  };

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        if (selectedFiplCode) {
          return (
            <EmployeeProfile
              fiplCode={selectedFiplCode}
              onBack={() => setSelectedFiplCode(null)}
            />
          );
        }
        return (
          <Employees onSelectEmployee={(fipl) => setSelectedFiplCode(fipl)} />
        );
      case "sales":
        return <SalesTrends />;
      case "feedback":
        return <Feedback />;
      case "settings":
        return <Settings />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar active={activeModule} onNavigate={handleNavigate} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header active={activeModule} />
        <main className="flex-1 overflow-y-auto p-6">{renderModule()}</main>
        <footer className="text-center text-xs text-muted-foreground py-3 border-t border-border bg-card">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
