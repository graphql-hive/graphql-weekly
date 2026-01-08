import chunk from "lodash.chunk";
import Flex from "../components/Flex";
import FlexCell from "../components/FlexCell";
import Card from "../components/Card";
import LinkCreator from "../product/LinkCreator";
import IssueCreator from "../product/IssueCreator";
import { ButtonLink } from "../components/Button";
import Loading from "../components/Loading";
import { useAllIssuesQuery } from "../generated/graphql";
import { useQueryClient } from "@tanstack/react-query";

export default function IssuesList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAllIssuesQuery();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["AllIssues"] });
  };

  if (isLoading) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  const allIssues = chunk(data?.allIssues ?? [], 10);

  return (
    <>
      <Card>
        <Flex>
          <FlexCell grow="0" basis="auto">
            <LinkCreator />
          </FlexCell>
          <FlexCell grow="0" basis="auto">
            <div style={{ marginLeft: 10 }}>
              <IssueCreator refresh={refresh} />
            </div>
          </FlexCell>
        </Flex>
      </Card>
      <Card>
        {allIssues.map((issues, index) => (
          <Flex key={index} margin="0 10px 0 0">
            {issues
              .sort((a, b) => {
                const aNum = parseInt(a.title?.split(" ")[1] ?? "0", 10);
                const bNum = parseInt(b.title?.split(" ")[1] ?? "0", 10);
                return bNum - aNum;
              })
              .map((issue) => (
                <FlexCell
                  key={issue.id}
                  margin="0 0 10px"
                  style={{ marginRight: 10, textAlign: "center" }}
                >
                  <ButtonLink
                    style={{ width: "100%" }}
                    color="grey-bg"
                    to={`/issue/${issue.id}`}
                  >
                    # {issue.title?.split(" ")[1]}
                  </ButtonLink>
                </FlexCell>
              ))}
          </Flex>
        ))}
      </Card>
    </>
  );
}
