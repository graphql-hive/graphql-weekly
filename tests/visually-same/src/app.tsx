import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { useEffect, useState } from 'react'

import { compareAll } from './compare.js'
import { takeAllScreenshots } from './screenshot.js'
import { CompareResult, Progress, Summary } from './ui.js'

interface AppProps {
  command: 'compare' | 'screenshot-production' | 'update-baseline'
}

export default function App({ command }: AppProps) {
  const [phase, setPhase] = useState<string>('')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState<
    { diffPercentage?: number; match: boolean; page: string }[]
  >([])
  const [passed, setPassed] = useState(0)
  const [failed, setFailed] = useState(0)

  useEffect(() => {
    runCommand(command)
  }, [command])

  async function runCommand(cmd: string) {
    switch (cmd) {
      case 'compare': {
        await runCompare()

        break
      }
      case 'screenshot-production': {
        await runScreenshotProduction()

        break
      }
      case 'update-baseline': {
        await runUpdateBaseline()

        break
      }
      // No default
    }
  }

  async function runCompare() {
    setPhase('Taking screenshots...')

    await takeAllScreenshots('local', (curr, tot, page) => {
      setCurrent(curr)
      setTotal(tot)
    })

    setPhase('Comparing images...')
    setCurrent(0)

    const result = await compareAll((curr, tot, page, compareResult) => {
      setCurrent(curr)
      setTotal(tot)
      setResults((prev) => [
        ...prev,
        {
          diffPercentage: compareResult.diffPercentage,
          match: compareResult.match,
          page,
        },
      ])
    })

    setPassed(result.passed)
    setFailed(result.failed)
    setPhase('Done!')
    setCurrent(result.passed + result.failed)
    setTotal(result.passed + result.failed)
  }

  async function runUpdateBaseline() {
    setPhase('Taking screenshots for baseline...')

    await takeAllScreenshots('baseline', (curr, tot) => {
      setCurrent(curr)
      setTotal(tot)
    })

    setPhase('Baseline updated!')
    setCurrent(total)
  }

  async function runScreenshotProduction() {
    setPhase('Taking production screenshots...')

    await takeAllScreenshots('production', (curr, tot) => {
      setCurrent(curr)
      setTotal(tot)
    })

    setPhase('Production screenshots taken!')
    setCurrent(total)
  }

  if (phase === '') {
    return (
      <Text color="cyan">
        <Spinner type="dots" /> Initializing...
      </Text>
    )
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text bold color="cyan">
          Visually Same
        </Text>
        <Text color="dim"> - {command}</Text>
      </Box>

      {results.length === 0 &&
        phase !== 'Done!' &&
        phase !== 'Baseline updated!' &&
        phase !== 'Production screenshots taken!' && (
          <Progress current={current} message={phase} total={total} />
        )}

      {results.length > 0 && (
        <Box flexDirection="column" gap={0}>
          {results.map((r, i) => (
            <CompareResult key={i} pageName={r.page} result={r} />
          ))}
        </Box>
      )}

      {(phase === 'Done!' ||
        phase === 'Baseline updated!' ||
        phase === 'Production screenshots taken!') && (
        <Box marginTop={1}>
          {command === 'compare' && (
            <Summary failed={failed} passed={passed} total={total} />
          )}
          {command === 'update-baseline' && (
            <Text bold color="green">
              ✓ Baseline updated successfully
            </Text>
          )}
          {command === 'screenshot-production' && (
            <Text bold color="green">
              ✓ Production screenshots saved
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
