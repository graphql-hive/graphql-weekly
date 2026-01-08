import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PanelProvider, PanelRoot } from "./components/Panels";
import Navbar from "./components/Navbar";
import IssueList from "./pages/IssueList";
import LinkAdder from "./pages/LinkAdder";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <PanelProvider>
      <PanelRoot />
      <Router>
        <>
          <Navbar />
          <Route path="/" exact component={LinkAdder} />
          <Route path="/issue/:id" exact component={IssueList} />
        </>
      </Router>
    </PanelProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
