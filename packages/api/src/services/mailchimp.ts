import { render } from '@react-email/components'
import { Newsletter, type NewsletterTopic } from '../email'

const MAILCHIMP_LIST_ID = 'b07e0b3012'

interface MailchimpConfig {
  apiKey: string
  serverPrefix?: string
}

export async function createEmailCampaign(
  config: MailchimpConfig,
  issueTitle: string,
  topics: NewsletterTopic[],
  versionCount: number,
  isFoundationEdition: boolean,
): Promise<{ campaignId: string }> {
  const serverPrefix = config.serverPrefix || 'us13'
  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`
  const authHeader = `Basic ${btoa(`anystring:${config.apiKey}`)}`

  // Create campaign
  const campaignResponse = await fetch(`${baseUrl}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      type: 'regular',
      recipients: {
        list_id: MAILCHIMP_LIST_ID,
      },
      settings: {
        subject_line: `GraphQL Weekly - ${issueTitle}`,
        reply_to: 'hello@graphqlweekly.com',
        from_name: 'GraphQL Weekly',
        title: `GraphQL Weekly - ${issueTitle} (version ${versionCount})`,
        inline_css: true,
      },
    }),
  })

  if (!campaignResponse.ok) {
    const error = await campaignResponse.text()
    throw new Error(`Failed to create Mailchimp campaign: ${error}`)
  }

  const campaign = (await campaignResponse.json()) as { id: string }
  const campaignId = campaign.id

  // Render email HTML
  const emailHtml = await render(
    Newsletter({ issueTitle, topics, isFoundationEdition }),
  )

  // Set campaign content
  const contentResponse = await fetch(
    `${baseUrl}/campaigns/${campaignId}/content`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        html: emailHtml,
      }),
    },
  )

  if (!contentResponse.ok) {
    const error = await contentResponse.text()
    throw new Error(`Failed to set campaign content: ${error}`)
  }

  return { campaignId }
}
