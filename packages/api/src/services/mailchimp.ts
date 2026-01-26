import { render } from '@react-email/components'

import { Newsletter, type NewsletterTopic } from '../email'

const MAILCHIMP_LIST_ID = 'b07e0b3012'

interface MailchimpConfig {
  apiKey: string
  serverPrefix?: string
}

export async function createEmailCampaign(
  config: MailchimpConfig,
  issueNumber: number,
  issueDate: string | undefined,
  topics: NewsletterTopic[],
  versionCount: number,
  isFoundationEdition: boolean,
): Promise<{ campaignId: string }> {
  const serverPrefix = config.serverPrefix || 'us13'
  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`
  const authHeader = `Basic ${btoa(`anystring:${config.apiKey}`)}`

  // Create campaign
  const campaignResponse = await fetch(`${baseUrl}/campaigns`, {
    body: JSON.stringify({
      recipients: {
        list_id: MAILCHIMP_LIST_ID,
      },
      settings: {
        from_name: 'GraphQL Weekly',
        inline_css: true,
        reply_to: 'hello@graphqlweekly.com',
        subject_line: `GraphQL Weekly - Issue ${issueNumber}`,
        title: `GraphQL Weekly - Issue ${issueNumber} (version ${versionCount})`,
      },
      type: 'regular',
    }),
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!campaignResponse.ok) {
    const error = await campaignResponse.text()
    throw new Error(`Failed to create Mailchimp campaign: ${error}`)
  }

  const campaign = (await campaignResponse.json()) as { id: string }
  const campaignId = campaign.id

  // Render email HTML
  const emailHtml = await render(
    Newsletter({ isFoundationEdition, issueDate, issueNumber, topics }),
  )

  // Set campaign content
  const contentResponse = await fetch(
    `${baseUrl}/campaigns/${campaignId}/content`,
    {
      body: JSON.stringify({
        html: emailHtml,
      }),
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    },
  )

  if (!contentResponse.ok) {
    const error = await contentResponse.text()
    throw new Error(`Failed to set campaign content: ${error}`)
  }

  return { campaignId }
}
