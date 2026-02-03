import { Component, createRef } from "react";

import { useIsMac } from "../../../hooks/useIsMac";
import { fetchGraphQL } from "../../../lib/api";
import { Code } from "../../shared/Code";
// Local
import { Run } from "../../vectors/Run";
import { Arrow } from "./Arrow";

type Props = {};
type State = {
  isResultStale: boolean;
  loading?: boolean;
  result?: string;
  selectedQuery: { query: string; title: string };
};

const queriesList: { query: string; title: string }[] = [
  {
    query: `
{
  allIssues(limit: 50) {
    id
    title
    published
    number
    date
  }
}
    `,
    title: "Query for all the issues",
  },
  {
    query: `
{
  allTopics(limit: 50) {
    title
    issue {
      number
    }
    links {
      url
      text
      title
    }
  }
}
    `,
    title: "Query all the topics and links",
  },
  {
    query: `
{
  issue(by: { number: 7 }) {
    id
    number
    title
    date
    published
  }
}
    `,
    title: "Query a specific issue",
  },
];

export class Playground extends Component<Props, State> {
  state: State = {
    isResultStale: false,
    loading: false,
    result: undefined,
    selectedQuery: queriesList[0],
  };
  private containerRef = createRef<HTMLDivElement>();
  private observer: IntersectionObserver | null = null;
  private hasRun = false;

  componentDidMount() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasRun) {
          this.hasRun = true;
          this.runQuery();
        }
      },
      { rootMargin: "0px 0px 500px 0px", threshold: 0.1 },
    );
    if (this.containerRef.current) {
      this.observer.observe(this.containerRef.current);
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  exampleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedQuery = queriesList.find((q) => q.title === e.target.value);
    if (selectedQuery) {
      this.setState({ isResultStale: true, selectedQuery });
    }
  };

  runQuery = async () => {
    this.setState({ loading: true });
    fetchGraphQL({ query: this.state.selectedQuery.query })
      .then((result) => {
        this.setState({
          result: result ? JSON.stringify(result, null, 2) : "",
        });
        this.setState({ isResultStale: false, loading: false });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        this.setState({ loading: false });
      });
  };

  render() {
    const { selectedQuery } = this.state;
    return (
      <div
        className="flex justify-between overflow-hidden max-h-271 pb-16 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-16 after:content-[''] after:bg-linear-to-b after:from-transparent after:to-footer-dark px-1 -mx-1"
        ref={this.containerRef}
      >
        <div className="flex-[0_0_400px] mr-16 pl-1 -ml-1">
          <span className="mb-11 inline-block font-medium leading-none text-2xl text-white">
            Enter a query
          </span>

          <label className="w-100 min-h-12 mb-4 p-4 inline-flex items-center bg-footer-box shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-sm cursor-pointer relative transition-colors duration-120 ease-out hover:bg-footer-box-hover group focus-within:ring-2 focus-within:ring-pink focus-within:ring-offset-2 focus-within:ring-offset-footer-dark">
            <select
              aria-label="Select query example"
              className="absolute top-0 bottom-0 right-0 w-full opacity-0 cursor-pointer"
              name="query-example"
              onChange={this.exampleChanged}
              value={selectedQuery.title}
            >
              {queriesList.map((q) => (
                <option key={q.title} value={q.title}>
                  {q.title}
                </option>
              ))}
            </select>
            <span
              className="mr-4 font-medium leading-none text-base uppercase"
              style={{ color: "rgba(255, 255, 255, 0.33)" }}
            >
              Example
            </span>
            <span className="mr-auto font-normal leading-none text-lg text-white">
              {selectedQuery.title}
            </span>
            <div className="opacity-70 group-hover:opacity-100">
              <Arrow />
            </div>
          </label>

          <div className="w-100 min-h-12 mb-4 p-4 bg-footer-box shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-sm">
            <Code background={false} language="graphql" showLineNumbers>
              {selectedQuery.query.trim()}
            </Code>

            <button
              className="flex items-center justify-center w-full min-h-10 p-3 mt-6 border-none bg-pink shadow-[0px_4px_10px_rgba(23,43,58,0.25)] rounded-sm cursor-pointer transition-all duration-140 ease-out hover:transform hover:-translate-y-px hover:shadow-[0px_7px_16px_rgba(23,43,58,0.22)] disabled:shadow-none disabled:bg-disabled focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              disabled={this.state.loading}
              onClick={this.runQuery}
            >
              <div className="mr-2">
                <Run />
              </div>
              {this.state.loading ? (
                <span className="font-medium leading-4 text-base uppercase text-white">
                  Fetching...
                </span>
              ) : (
                <span className="font-medium leading-4 text-base uppercase text-white">
                  Run query
                </span>
              )}
            </button>
          </div>
          <div
            className="w-full h-4 font-normal leading-none text-base text-center"
            style={{ color: "rgba(255, 255, 255, 0.33)" }}
          >
            or press <KeyboardShortcut fallback="Ctrl" modifier="Cmd" /> + Enter
          </div>
        </div>
        <div className="grow h-auto">
          <span className="mb-11 inline-block font-medium leading-none text-2xl text-white">
            Result
          </span>

          <Code
            background={false}
            customStyle={
              this.state.isResultStale ? { opacity: 0.5 } : undefined
            }
            language="json"
          >
            {this.state.result || ""}
          </Code>
        </div>
      </div>
    );
  }
}

function KeyboardShortcut({
  fallback,
  modifier,
}: {
  fallback: string;
  modifier: string;
}) {
  const isMac = useIsMac();
  return isMac ? modifier : fallback;
}
