export const About = () => {
  return (
    <div className="flex w-full justify-center items-center">
      <div className="font-normal leading-6 text-lg text-[rgba(255,255,255,0.33)] [&_a]:underline [&_a]:text-[rgba(255,255,255,0.5)] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-white [&_a]:focus-visible:outline-offset-2">
        Curated by <a href="https://the-guild.dev/">The Guild</a>, and the
        awesome GraphQL community.
      </div>
    </div>
  );
};
