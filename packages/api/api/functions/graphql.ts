require('dotenv').config()
import { schema } from '../schema'
import { createContext } from '../context'
import { createYoga } from 'graphql-yoga'
import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'

export const yoga = createYoga({
  graphqlEndpoint: '/.netlify/functions/graphql',
  schema,
  context: (req) => {
    return createContext(req.request)
  },
})

async function handler(
  event: APIGatewayEvent,
  lambdaContext: Context,
): Promise<APIGatewayProxyResult> {
  const response = await yoga.fetch(
    event.path +
      '?' +
      new URLSearchParams(
        (event.queryStringParameters as Record<string, string>) || {},
      ).toString(),
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
        : undefined,
    },
    {
      event,
      lambdaContext,
    },
  )

  const responseHeaders: Record<string, string> = {}

  response.headers.forEach((value, name) => {
    responseHeaders[name] = value
  })

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
    isBase64Encoded: false,
  }
}

export { handler }
