import React, { Fragment } from "react";
import withRouter from "react-router-dom/withRouter";
import Flex from "./components/Flex";
import FlexCell from "./components/FlexCell";
import Card from "./components/Card";
import LinkCreator from "./product/LinkCreator";
import IssueCreator from "./product/IssueCreator";
import IssuesList from "./product/IssuesList";

function Curations() {
  return (
    <Fragment>
      <Card>
        <Flex>
          <FlexCell grow="0" basis="auto">
            <LinkCreator />
          </FlexCell>
          <FlexCell grow="0" basis="auto">
            <div style={{ marginLeft: 10 }}>
              <IssueCreator />
            </div>
          </FlexCell>
        </Flex>
      </Card>

      <IssuesList />
    </Fragment>
  );
}

export default withRouter(Curations);
