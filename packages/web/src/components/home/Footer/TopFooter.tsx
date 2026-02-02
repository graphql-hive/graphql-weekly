import { ArrowLink } from "../../shared/ArrowLink";

export const TopFooter = () => {
  return (
    <div className="flex w-full justify-between">
      <div className="font-normal leading-6 text-lg text-white/50">
        Feeling nerdy? Query issues of GraphQL Weekly with actual GraphQL.
      </div>
      <div className="font-normal leading-6 text-lg text-white/50 **:font-normal [&_svg]:opacity-30">
        <ArrowLink
          className="hover:text-white text-white/33 underline"
          href="https://graphql-weekly.graphcdn.app/"
          text="Open GraphiQL"
        />
      </div>
    </div>
  );
};
