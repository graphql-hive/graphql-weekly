import React, { Fragment } from "react";
import withRouter from "react-router-dom/withRouter";
import Flex from "./components/Flex";
import Card from "./components/Card";
import LinkCreator from "./product/LinkCreator";
import IssueCreator from "./product/IssueCreator";
import IssuesList from "./product/IssuesList";

function Curations() {
  return (
    <Fragment>
      <Card>
        <Flex>
          <LinkCreator />
          <div style={{ marginLeft: 10 }}>
            <IssueCreator />
          </div>
        </Flex>
      </Card>

      <IssuesList />
    </Fragment>
  );
}

export default withRouter(Curations);
