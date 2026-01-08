import { Box, Text } from 'ink'
import React from 'react'

export function StatusIcon({ status }: { status: 'fail' | 'loading' | 'pass' | 'pending' }) {
  const icons = {
    fail: '✗',
    loading: '…',
    pass: '✓',
    pending: '○',
  }

  const colors = {
    fail: 'red',
    loading: 'cyan',
    pass: 'green',
    pending: 'yellow',
  }

  return (
    <Text bold color={colors[status]}>
      {icons[status]}
    </Text>
  )
}

export function Progress({ current, message, total }: { current: number; message: string; total: number; }) {
  const progress = Math.round((current / total) * 100)
  
  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text color="cyan">
          <Text color="dim">[{current}/{total}]</Text> {message}
        </Text>
      </Box>
      <Box>
        <Text color="dim">
          {'█'.repeat(Math.floor(progress / 2))}
          {'░'.repeat(50 - Math.floor(progress / 2))}
        </Text>
      </Box>
    </Box>
  )
}

export function CompareResult({ pageName, result }: { pageName: string; result: { diffPercentage?: number; match: boolean; reason?: string; } }) {
  const status = result.match ? 'pass' : 'fail'
  
  return (
    <Box gap={2}>
      <StatusIcon status={status} />
      <Text>
        {pageName}
      </Text>
      {!result.match && (
        <Text color="dim">
          {' '}(diff: {result.diffPercentage?.toFixed(2)}%)
        </Text>
      )}
    </Box>
  )
}

export function Summary({ failed, passed, total }: { failed: number; passed: number; total: number }) {
  const allPassed = failed === 0
  
  return (
    <Box flexDirection="column" gap={1} marginTop={1}>
      <Box>
        <Text bold>Results:</Text>
      </Box>
      <Box gap={4}>
        <Text color={passed > 0 ? 'green' : 'dim'}>
          ✓ {passed} passed
        </Text>
        <Text color={failed > 0 ? 'red' : 'dim'}>
          ✗ {failed} failed
        </Text>
        <Text color="dim">
          ({total} total)
        </Text>
      </Box>
      {allPassed && (
        <Box marginTop={1}>
          <Text bold color="green">
            ✓ All images match baseline!
          </Text>
        </Box>
      )}
      {!allPassed && (
        <Box marginTop={1}>
          <Text bold color="red">
            ✗ Visual changes detected
          </Text>
        </Box>
      )}
    </Box>
  )
}
