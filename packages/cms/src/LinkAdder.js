import React from "react";
import FlatButton from "material-ui/FlatButton";
import withRouter from "react-router-dom/withRouter";
import Flex from "./components/Flex";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import LinkCreator from "./product/LinkCreator";
import IssueCreator from "./product/IssueCreator";

class LinkAdder extends React.Component {
  constructor(props) {
    super(props);

    // client
    //   .query(
    //     `
    //         {
    //           allIssues{
    //             id
    //             title
    //             published
    //           }
    //         }
    //     `
    //   )
    //   .then(result => {
    //     this.setState({
    //       issues: result.allIssues
    //     });
    //   });

    this.state = {
      issues: []
    };
  }

  renderIssues() {
    return this.state.issues.map(issue => {
      return (
        <FlatButton
          key={issue.id}
          label={issue.title}
          disabled={issue.published}
          onTouchTap={() => {
            this.pros.history.push("/issue/" + issue.id);
          }}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <Navbar />

        <Card>
          <Flex>
            <LinkCreator />
            <div style={{ marginLeft: 10 }}>
              <IssueCreator />
            </div>
          </Flex>
        </Card>

        <Card>{this.renderIssues()}</Card>
      </div>
    );
  }
}

export default withRouter(LinkAdder);
