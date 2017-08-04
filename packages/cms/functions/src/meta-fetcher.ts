import { callbackRuntime, APIGatewayEvent } from 'lambda-helpers'
import { GraphQLClient } from 'graphql-request'
import ogs = require('open-graph-scraper')

interface Payload {
  data: {
    Link: {
      node: {
        id: string
        url: string
      }
    }
  }
}

export default callbackRuntime(async (event: APIGatewayEvent): Promise<any> => {

  const payload = JSON.parse(event.body) as Payload

  const headers = {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NzA1Nzc5MzcsImNsaWVudElkIjoiY2lvcTk1b2VjMDJrajAxbzBvbmpvcHBmOSIsInByb2plY3RJZCI6ImNpcGIxMTFwdzVmZ3QwMW8wZTdodngybGYiLCJzeXN0ZW1Ub2tlbklkIjoiY2lya280dXJtMG1udTAxMjRjMGgzZ3M0cyJ9.W_gizkkXVZ56hPqS9MZB6fzA5Ti15UP8q9pADoMEk60'
  }
  const client = new GraphQLClient('https://api.graph.cool/simple/v1/cipb111pw5fgt01o0e7hvx2lf', { headers })

  const url = payload.data.Link.node.url

  const metaData = await new Promise<{title: string}>((resolve, reject) => {
    ogs({ url }, (err, results) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ title: results.data.ogTitle || 'n/a' })
    })
  })


  const query = `mutation {
    setMetaInfo: updateLink(
      id: "${payload.data.Link.node.id}",
      title: "${metaData.title}"
    ) {
      id
    }
  }`
  await client.request(query)

  return {
    statusCode: 204,
  }
})
