import React, { useState, useEffect } from 'react'
import { Box, Text, render } from 'ink'
import Spinner from 'ink-spinner'
import { takeAllScreenshots } from './screenshot.js'
import { compareAll } from './compare.js'
import { Progress, CompareResult, Summary } from './ui.js'

interface AppProps {
  command: 'compare' | 'update-baseline' | 'screenshot-production'
}

export default function App({ command }: AppProps) {
  const [phase, setPhase] = useState<string>('')
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState<Array<{ page: string; match: boolean; diffPercentage?: number }>>([])
  const [passed, setPassed] = useState(0)
  const [failed, setFailed] = useState(0)

  useEffect(() => {
    runCommand(command)
  }, [command])

  async function runCommand(cmd: string) {
    if (cmd === 'compare') {
      await runCompare()
    } else if (cmd === 'update-baseline') {
      await runUpdateBaseline()
    } else if (cmd === 'screenshot-production') {
      await runScreenshotProduction()
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
      setResults(prev => [...prev, { page, match: compareResult.match, diffPercentage: compareResult.diffPercentage }])
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
    return <Text color="cyan"><Spinner type="dots" /> Initializing...</Text>
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text bold color="cyan">
          Visually Same
        </Text>
        <Text color="dim"> - {command}</Text>
      </Box>
      
      {results.length === 0 && phase !== 'Done!' && phase !== 'Baseline updated!' && phase !== 'Production screenshots taken!' && (
        <Progress current={current} total={total} message={phase} />
      )}
      
      {results.length > 0 && (
        <Box flexDirection="column" gap={0}>
          {results.map((r, i) => (
            <CompareResult key={i} pageName={r.page} result={r} />
          ))}
        </Box>
      )}
      
      {(phase === 'Done!' || phase === 'Baseline updated!' || phase === 'Production screenshots taken!') && (
        <Box marginTop={1}>
          {command === 'compare' && (
            <Summary passed={passed} failed={failed} total={total} />
          )}
          {command === 'update-baseline' && (
            <Text color="green" bold>✓ Baseline updated successfully</Text>
          )}
          {command === 'screenshot-production' && (
            <Text color="green" bold>✓ Production screenshots saved</Text>
          )}
        </Box>
      )}
    </Box>
  )
}
