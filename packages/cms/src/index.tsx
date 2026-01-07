import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { PanelProvider, PanelRoot } from "./components/Panels";
import Navbar from "./components/Navbar";
import IssueList from "./pages/IssueList";
import LinkAdder from "./pages/LinkAdder";
import client from "./client";
import "./index.css";

ReactDOM.render(
  <ApolloProvider client={client}>
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
  </ApolloProvider>,
  document.getElementById("root"),
);
