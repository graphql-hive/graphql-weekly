import React from 'react'

export default function Home() {
  return (
    <>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: '100px' }}>GraphQLWeekly API</h1>
        <p style={{ fontSize: '20px' }}>
          Made with ❤️ by <a href="https://www.prisma.io/">Prisma</a>{' '}
        </p>
      </main>
    </>
  )
}
