import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PanelProvider, PanelRoot } from "./components/Panels";
import IndexPage from "./pages/index";
import IssuePage from "./pages/issue";
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
      <Switch>
        <Route path="/" component={IndexPage} />
        <Route path="/issue/:id" component={IssuePage} />
      </Switch>
    </PanelProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
