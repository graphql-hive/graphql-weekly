import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import App from "./App";
import "./index.css";
import Navbar from './components/Navbar';
import LinkAdder from "./LinkAdder";
import client from "./client";

const theme = getMuiTheme({
  palette: {
    primary1Color: "#00C853"
  }
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <MuiThemeProvider muiTheme={theme}>
      <Router>
        <Fragment>
          <Navbar />
          <Route path="/" component={LinkAdder} />
          <Route path="/issue/:id" component={App} />
        </Fragment>
      </Router>
    </MuiThemeProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
