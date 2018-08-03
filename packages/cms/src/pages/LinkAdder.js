import React, { Fragment } from "react";
import withRouter from "react-router-dom/withRouter";
import IssuesList from "../product/IssuesList";

function Curations() {
  return (
    <Fragment>
      <IssuesList />
    </Fragment>
  );
}

export default withRouter(Curations);
