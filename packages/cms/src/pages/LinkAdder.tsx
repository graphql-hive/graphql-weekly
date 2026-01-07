import withRouter from "react-router-dom/withRouter";
import IssuesList from "../product/IssuesList";

function Curations() {
  return (
    <>
      <IssuesList />
    </>
  );
}

export default withRouter(Curations);
