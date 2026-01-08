import React from 'react'
import { Text, Box } from 'ink'

export function StatusIcon({ status }: { status: 'pending' | 'pass' | 'fail' | 'loading' }) {
  const icons = {
    pending: '○',
    pass: '✓',
    fail: '✗',
    loading: '…',
  }

  const colors = {
    pending: 'yellow',
    pass: 'green',
    fail: 'red',
    loading: 'cyan',
  }

  return (
    <Text color={colors[status]} bold>
      {icons[status]}
    </Text>
  )
}

export function Progress({ current, total, message }: { current: number; total: number; message: string }) {
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

export function CompareResult({ pageName, result }: { pageName: string; result: { match: boolean; reason?: string; diffPercentage?: number } }) {
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

export function Summary({ passed, failed, total }: { passed: number; failed: number; total: number }) {
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
          <Text color="green" bold>
            ✓ All images match baseline!
          </Text>
        </Box>
      )}
      {!allPassed && (
        <Box marginTop={1}>
          <Text color="red" bold>
            ✗ Visual changes detected
          </Text>
        </Box>
      )}
    </Box>
  )
}
