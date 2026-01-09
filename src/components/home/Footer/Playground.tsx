import * as React from 'react'

// Local
import Run from '../../vectors/Run'
import Arrow from './Arrow'
import { Code } from '../../shared/Code'
import { fetchGraphQL } from '../../../lib/api'

type Props = {}
type State = {
  selectedQuery: { title: string; query: string }
  result?: string
  loading?: boolean
  isResultStale: boolean
}

const queriesList: { title: string; query: string }[] = [
  {
    title: 'Query for all the issues',
    query: `
{
  allIssues {
    id
    title
    published
    number
    date
    author {
      avatarUrl
      description
      name
    }
  }
}
    `,
  },
  {
    title: 'Query all the topics and links',
    query: `
{
  allTopics {
    title
    links {
      url
      text
      position
      title
      url
    }
  }
}
    `,
  },
  {
    title: 'Query a specific issue',
    query: `
{
  issue(number: 1) {
    id
    number
    title
    date
    published
  }
}
    `,
  },
]

export class Playground extends React.Component<Props, State> {
  state: State = {
    selectedQuery: queriesList[0],
    loading: false,
    isResultStale: false,
    result: undefined,
  }
  private containerRef = React.createRef<HTMLDivElement>()
  private observer: IntersectionObserver | null = null
  private hasRun = false

  componentDidMount() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasRun) {
          this.hasRun = true
          this.runQuery()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 500px 0px' },
    )
    if (this.containerRef.current) {
      this.observer.observe(this.containerRef.current)
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect()
  }

  exampleChanged = (e: any) => {
    const selectedQuery = queriesList.find((q) => q.title === e.target.value)
    if (selectedQuery) {
      this.setState({ selectedQuery, isResultStale: true })
    }
  }

  runQuery = async () => {
    this.setState({ loading: true })
    fetchGraphQL({ query: this.state.selectedQuery.query })
      .then((result) => {
        this.setState({ result: result ? JSON.stringify(result, null, 2) : '' })
        this.setState({ loading: false, isResultStale: false })
      })
      .catch((err) => {
        console.log(err)
        this.setState({ loading: false })
      })
  }

  render() {
    const { selectedQuery } = this.state
    return (
      <div
        ref={this.containerRef}
        className="flex justify-between overflow-hidden max-h-[1084px] relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-10 after:content-[''] after:bg-gradient-to-b after:from-transparent after:to-[#081146]"
      >
        <div className="flex-[0_0_400px] mr-16">
          <span className="mb-11 inline-block font-medium leading-none text-2xl text-white">
            Enter a query
          </span>

          <label className="w-[400px] min-h-12 mb-4 p-4 inline-flex items-center bg-[#1b2357] shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded cursor-pointer relative transition-colors duration-[120ms] ease-out hover:bg-[#2c3363] group">
            <select
              onChange={this.exampleChanged}
              value={selectedQuery.title}
              className="absolute top-0 bottom-0 right-0 w-full opacity-0 cursor-pointer"
            >
              {queriesList.map((q, i) => (
                <option key={q.title} value={q.title}>
                  {q.title}
                </option>
              ))}
            </select>
            <span
              className="mr-4 font-medium leading-none text-base uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.33)' }}
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

          <div className="w-[400px] min-h-12 mb-4 p-4 bg-[#1b2357] shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded">
            <Code background={false} language="graphql" showLineNumbers>
              {selectedQuery.query.trim()}
            </Code>

            <button
              onClick={this.runQuery}
              disabled={this.state.loading}
              className="flex items-center justify-center w-full min-h-10 p-3 mt-6 border-none outline-none bg-[#f531b1] shadow-[0px_4px_10px_rgba(23,43,58,0.25)] rounded cursor-pointer transition-all duration-[140ms] ease-out hover:transform hover:-translate-y-px hover:shadow-[0px_7px_16px_rgba(23,43,58,0.22)] disabled:shadow-none disabled:bg-[#959595]"
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
            style={{ color: 'rgba(255, 255, 255, 0.33)' }}
          >
            or press CMD + Enter
          </div>
        </div>
        <div className="flex-grow h-auto">
          <span className="mb-11 inline-block font-medium leading-none text-2xl text-white">
            Result
          </span>

          <Code
            background={false}
            language="json"
            customStyle={
              this.state.isResultStale ? { opacity: 0.5 } : undefined
            }
          >
            {this.state.result || ''}
          </Code>
        </div>
      </div>
    )
  }
}
