import graphqlconfImg from "./graphqlconf.png";

export function SideBanner() {
  return (
    <div className="ml-[23px] max-w-[300px]">
      <a
        className="flex hover:ring-3 hover:ring-purple/20 rounded-xs hover:ring-offset-body-bg hover:ring-offset-0 focus-visible:outline-2 focus-visible:outline-purple shadow-[0px_7px_16px_rgba(23,43,58,0)] focus-visible:outline-offset-0 group hover:-translate-y-px hover:shadow-[0px_7px_16px_rgba(23,43,58,0.22)] transition duration-140 ease-out"
        // TODO: Replace with the new YouTube link when the videos stop being Unlisted?
        href="https://graphql.org/conf/2025/schedule/"
        // href="https://youtube.com/playlist?list=PLP1igyLx8foEO0qsyk3IFn1peYSVGDBFA&si=QjgZ1xXp6pIfKFTv&utm_source=graphql_weekly&utm_medium=website&utm_campaign=cta"
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt="GraphQL Conf"
          className="rounded-xs"
          loading="lazy"
          src={graphqlconfImg.src}
          width="339px"
        />
      </a>
    </div>
  );
}
