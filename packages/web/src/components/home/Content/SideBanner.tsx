import graphqlconfImg from "./graphqlconf.png";

export function SideBanner() {
  return (
    <div className="ml-[23px] max-w-[300px]">
      <a
        href="https://youtube.com/playlist?list=PLP1igyLx8foEO0qsyk3IFn1peYSVGDBFA&si=QjgZ1xXp6pIfKFTv&utm_source=graphql_weekly&utm_medium=website&utm_campaign=cta"
        rel="noreferrer"
        target="_blank"
      >
        <img alt="GraphQL Conf" src={graphqlconfImg.src} width="339px" />
      </a>
    </div>
  );
}
