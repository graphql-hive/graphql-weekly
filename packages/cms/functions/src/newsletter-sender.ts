import { callbackRuntime, APIGatewayEvent } from 'lambda-helpers';
import 'source-map-support/register';
import mcapi = require('mailchimp-api');
import urlParser = require('url');

interface Payload {
  data: {
    Issue: {
      updatedFields: string[];
      node: Issue;
    };
  };
}

interface Issue {
  id: string;
  title: string;
  published: boolean;
  versionCount: number;
  topics: Topic[];
}

interface Topic {
  title: string;
  links: Link[];
}

interface Link {
  url: string;
  title: string;
  text: string;
}

export default callbackRuntime(
  async (event: APIGatewayEvent): Promise<any> => {
    const payload = JSON.parse(event.body) as Payload;
    const issue = payload.data.Issue.node;

    const mailchimpKey = 'MAILCHIMP_API_KEY_REDACTED';
    const mailchimpListId = 'b07e0b3012';

    const mc = new mcapi.Mailchimp(mailchimpKey);

    const shouldRun =
      issue.published &&
      payload.data.Issue.updatedFields.includes('versionCount');

    if (!shouldRun) {
      console.log('Nothing to do here...');
      return {
        statusCode: 204,
      };
    }

    await new Promise((resolve, reject) => {
      const params = {
        options: {
          list_id: mailchimpListId,
          subject: `GraphQL Weekly - ${issue.title}`,
          from_email: 'hello@graphqlweekly.com',
          from_name: 'GraphQL Weekly',
          inline_css: true,
          title: `GraphQL Weekly - ${issue.title} (version ${
            issue.versionCount
            })`,
        },
        content: {
          html: formatTemplate(issue),
        },
        type: 'regular',
      };

      mc.campaigns.create(params, resolve, reject);
    });

    return {
      statusCode: 204,
    };
  },
);

const colorMap = {
  default: '#f531b1',
  articles: '#f531b1',
  tutorials: '#6560E2',
  'community & events': '#009BE3',
  videos: '#27AE60',
  'tools & open source': '#F0950C',
  'open source': '#F0950C',
  conference: '#6560E2',
};

/**
 * Render the first section and all other Topics of an issue
 * @param issue
 */
function renderContent(
  issue: Issue,
): {
  firstTopic: {
    text: string;
    color: string;
    title: string;
  };
  content: string;
} {
  const firstTopic = issue.topics.slice(0, 1)[0];
  const restTopics = issue.topics.slice(1);

  return {
    firstTopic: {
      title: firstTopic.title,
      color: getColor(firstTopic.title),
      text: renderTopicContent(firstTopic),
    },
    content: renderTopics(restTopics),
  };
}

function renderTopics(topics: Topic[]) {
  return topics.map(renderTopic).join('\n');
}

function getColor(title: string): string {
  return colorMap[title.toLowerCase()] || colorMap.default;
}

function renderTopic(topic: Topic) {
  const color = getColor(topic.title);

  const slug = slugify(topic.title);
  const className = `article-box-${slug}`;

  return `<table
  border="0"
  cellpadding="0"
  cellspacing="0"
  width="100%"
  class="articleBox"
>
  <tr>
    <td bgcolor="${color}" class="colorBorder" width="8px"></td>
    <td valign="top" class="articleBox__content ${className}">

      <style>
        .${className} a {
          color: ${color};
        }
      </style>

      <h2 class="articleTitle" style="color: ${color}">${topic.title}</h2>

      ${renderTopicContent(topic)}
    </td>
  </tr>
</table>
<div class="hSpace"></div> 
`;
}

function renderTopicContent(topic: Topic) {
  return topic.links.map(renderLink).join('\n<div class="hr"></div>\n');
}

function renderLink({ url, title, text }: Link) {
  return `<a href="${url}" target="_blank">
    <h1>${title}</h1>
  </a>
  <p mc:edit="article_content">
    ${text}
  </p>`;
}

function formatTemplate(issue: Issue) {
  const { firstTopic, content } = renderContent(issue);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>*|MC:SUBJECT|*</title>
      <style type="text/css">
        @import url("http://fonts.googleapis.com/css?family=Rubik:400,500,700");
  
        body {
          margin: 0;
          padding: 0;
          min-width: 100% !important;
          font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
  
        p,
        span,
        h1,
        h2,
        td {
          font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
  
        table {
          border-collapse: collapse;
        }
  
        .wrapper {
          width: 680px;
          max-width: 680px;
        }
  
        .logo {
          float: left;
          margin-left: -7px;
        }
        .logo img {
          float: left;
          width: 55px;
          height: 55px;
          margin-top: -3px;
        }
        .logo__content {
          float: left;
          margin-left: 6px;
        }
        .logo__title {
          font-weight: 500;
          line-height: 15px;
          font-size: 16px;
          color: #ffffff;
        }
        .logo__subtitle {
          font-weight: bold;
          line-height: 25px;
          font-size: 25px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
  
        .viewLink {
          float: right;
          margin-top: 12px;
          text-decoration: none;
        }
        .viewLink__span {
          font-weight: 500;
          line-height: 18px;
          font-size: 18px;
          text-align: right;
          color: #ffffff;
        }
        .viewLink img {
          margin-left: 10px;
        }
  
        .firstContent > tr > td {
          padding-top: 40px;
        }
  
        .emailTitle {
          margin-top: -48px;
          margin-bottom: 32px;
          width: auto;
          display: inline-block;
          padding-left: 12px;
          padding-right: 12px;
          height: 32px;
          box-sizing: border-box;
          padding-top: 9px;
  
          background: #6560e2;
          border-radius: 32px;
          text-align: center;
          color: #fff;
  
          /* text */
  
          font-weight: 500;
          line-height: 16px;
          font-size: 16px;
          text-transform: uppercase;
  
          color: #ffffff;
        }
        .emailTitle span {
          opacity: 0.66;
        }

        .articleBox {
          background: #f6f6f7;
          box-shadow: 0px 4px 16px rgba(8, 17, 70, 0.05);
          border-radius: 8px;
        }
  
        .ConfBox {
          overflow: hidden;
          background: #f6f6f7;
          box-shadow: 0px 4px 16px rgba(8, 17, 70, 0.05);
          border-radius: 8px;
        }
        .ConfBox {
          display: block;
        }
  
        .articleBox__content {
          padding-top: 48px;
          padding-bottom: 48px;
          padding-right: 48px;
          padding-left: 40px;
        }
  
        .issueBox__content {
          padding-top: 32px;
        }
        .articleBox__content a {
          color: #d60690;
        }
  
        .colorBorder {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
  
        .articleBox__content h1 {
          margin: 0;
          text-align: left;
          font-weight: 500;
          line-height: 1.33;
          font-size: 24px;
          color: #081146;
          text-decoration: none;
        }
        .articleBox__content a {
          text-decoration: none;
          color: #081146;
        }
        .articleBox__content h2 {
          margin: 0;
          padding-bottom: 32px;
          text-align: left;
        }
        .articleBox__content p {
          margin: 24px 0 0 0;
  
          text-align: left;
          font-weight: 300;
          line-height: 1.75;
          font-size: 16px;
  
          color: #081146;
        }
        .articleBox__content strong {
          font-weight: 500;
        }

        .author {
          width: 100%;
          margin-top: 32px;
        }
        .author__avatar {
          width: 40px;
          height: 40px;
          float: left;
        }
        .author__avatar img {
          width: 40px;
          height: 40px;
        }
        .author__details {
          float: left;
          margin-left: 16px;
          text-align: left;
        }
        .author__name {
          font-weight: 500;
          line-height: 16px;
          font-size: 16px;
          color: #081146;
        }
        .author__bio {
          margin-top: 8px;
  
          font-weight: 300;
          line-height: 16px;
          font-size: 16px;
          color: #4d5379;
        }

        /* Articles */
        .articleTitle {
          padding-top: 0;
          margin-bottom: 32px;
  
          font-weight: 500;
          line-height: 18px;
          font-size: 18px;
          text-transform: uppercase;
        }
        .hr {
          width: 100%;
          height: 1px;
          border-top: 1px solid rgb(197, 200, 220);
          margin-top: 40px;
          margin-bottom: 40px;
        }
        .ConfImage {
          width: 100%;
        }
        .footerItems__items {
          padding-bottom: 8px;
          display: inline-block;
          margin-left: 33px;
  
          font-weight: 500;
          line-height: 18px;
          font-size: 18px;
          text-align: center;
          text-decoration: none;
          vertical-align: middle;
          color: #081146;
        }
        .footerItems__items:first-child {
          margin-left: 0;
        }
        .footerItems__items img {
          margin-right: 16px;
          vertical-align: middle;
        }
        .footerItems__items span {
          margin-right: 16px;
          vertical-align: middle;
        }
  
        .archiveIcon {
          width: 16px;
          height: 14px;
        }
        .twitterIcon {
          width: 22px;
          height: 18px;
        }
        .slackIcon {
          width: 22px;
          height: 22px;
        }
  
        .halfBannersTable {
          width: 100%;
        }

        .halfBanner {
          width: 332px;
          height: 340px;
          display: inline-block;
        }

        .projectSpacer {
          width: 8px;
          height: 8px;
          display: inline-block;
        }

        .footerText {
          line-height: 20px;
          font-size: 14px;
          text-align: center;
  
          color: #698391;
        }
  
        .footerText a {
          color: #698391;
        }
        .sideSpace {
          min-width: 10px;
        }
        .hSpace {
          width: 100%;
          height: 16px;
        }

        .mailchimp img {
          width: 50px;
          height: auto;
        }
  
        @media only screen and (max-width: 800px) {
          .wrapper {
            width: 100% !important;
          }
          .content > tr > td {
            padding: 0 15px;
          }
          .wrapper > tr > td {
            width: 100% !important;
          }
  
          .footerItems__items {
            float: none !important;
            margin-left: 0 !important;
          }
  
          .articleBox__content {
            /* padding-top: 16px ; */
            padding-bottom: 16px;
            padding-right: 16px;
            padding-left: 18px;
          }
          .viewLink__span {
            font-size: 16px !important;
          }
          .viewLink img {
            display: none !important;
          }
  
          .articleBox__content h1 {
            font-size: 20px !important;
          }
  
          .articleBox__content p {
            font-size: 14px !important;
          }
  
          .halfBannersTable {
            width: 50%;
          }

          .footerItems__items {
            padding-bottom: 8px !important;
          }
        }
      </style>
    </head>
    <body>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container">
        <tr>
          <td align="center" valign="top" bgcolor="#E5E5E5">
            <!-- start email body -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr height="284px">
                <td bgcolor="#D60690" class="sideSpace">&nbsp;</td>
                <td
                  rowspan="2"
                  bgcolor="#D60690"
                  class="wrapper"
                  style="border-radius: 0 0 9px 9px;"
                >
                  <!-- top header content -->
                  <table border="0" cellpadding="0" cellspacing="0" class="wrapper">
                    <tr>
                      <td valign="top" style="padding-top: 40px;">
                        <!-- start content -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding-bottom: 25px;">
                              <div class="logo">
                                <img
                                  src="https://weeklyletter.netlify.com/assets/WeeklyLogo.png"
                                  width="55"
                                  height="55"
                                />
                                <div class="logo__content">
                                  <div class="logo__title">GraphQL</div>
                                  <div class="logo__subtitle">Weekly</div>
                                </div>
                              </div>
                              <a class="viewLink" href="*|LIST:URL|*">
                                <span class="viewLink__span">View in browser</span>
                                <img src="https://weeklyletter.netlify.com/assets/Arrow.png" />
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                class="content"
                              >
                                <tr>
                                  <td align="center">
                                    <!-- First Content Box -->
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="articleBox"
                                    >
                                      <tr>
                                        <td
                                          bgcolor="${firstTopic.color}"
                                          class="colorBorder"
                                          width="8px"
                                        ></td>
                                        <td
                                          valign="top"
                                          align="center"
                                          class="articleBox__content issueBox__content"
                                        >
                                          <!-- Blue Issue Tag -->
                                          <table
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                          >
                                            <tr>
                                              <td align="center">
                                                <div class="emailTitle">
                                                  *|MC:SUBJECT|*
                                                </div>
                                              </td>
                                            </tr>
                                          </table>

                                          <h2 class="articleTitle" style="color: ${
    firstTopic.color
    }">${firstTopic.title}</h2>
  
                                          ${firstTopic.text}
  
                                          <!-- Author details -->
  
                                          <!-- <table
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                            class="author"
                                          >
                                            <tr>
                                              <td  width="40"  style="padding-right: 16px;">
                                                <div class="author__avatar">
                                                  <img
                                                    src="https://weeklyletter.netlify.com/assets/NikolasBurk.png"
                                                    width="40"
                                                    height="40"
                                                  />
                                                </div>
                                              </td>
                                              <td>
                                                <div class="author__name">
                                                  Nikolas Burk
                                                </div>
                                                <div class="author__bio">
                                                  Full-Stack Developer at
                                                  Graphcool
                                                </div>
                                              </td>
                                            </tr>
                                          </table> -->
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td bgcolor="#D60690" class="sideSpace">&nbsp;</td>
              </tr>
  
              <tr>
                <td class="sideSpace">&nbsp;</td>
                <td class="sideSpace">&nbsp;</td>
              </tr>
  
              <tr>
                <td class="sideSpace">&nbsp;</td>
                <td>
                  <table border="0" cellpadding="0" cellspacing="0" class="wrapper">
                    <tr>
                      <td valign="top">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          class="content"
                        >
                          <tr>
                            <td align="center">
                              <div class="hSpace"></div>

                              ${content}

                              <!-- BANNERS -->
                              <!-- 7th Content Box -->
                              <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              class="ConfBox"
                            >
                              <tr>
                                <td valign="top">
                                  <img
                                      src="https://i.imgur.com/9AHra8X.png"
                                      class="ConfImage"
                                      width="680"
                                      height="340"
                                      style="max-width: 100%; height: auto;"
                                  />
                                </td>
                              </tr>
                            </table>
  
                              <div class="hSpace"></div>
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                style="margin-top: 64px;"
                              >
                                <tr>
                                  <td align="center" valign="center">
                                    <a href="https://www.graphqlweekly.com/" class="footerItems__items">
                                      <img
                                        src="https://weeklyletter.netlify.com/assets/Archive.png"
                                        class="archiveIcon"
                                      /><span>View all issues</span>
                                    </a>
                                    <a href="https://twitter.com/graphqlweekly?lang=en" class="footerItems__items">
                                      <img
                                        src="https://weeklyletter.netlify.com/assets/Twitter.png"
                                        class="twitterIcon"
                                      /><span>Follow on Twitter</span>
                                    </a>
                                    <a href="https://slack.prisma.io/" class="footerItems__items">
                                      <img
                                        src="https://weeklyletter.netlify.com/assets/Slack.png"
                                        class="slackIcon"
                                      /><span>Join us on Slack</span>
                                    </a>
                                  </td>
                                </tr>
                              </table>
  
                              <!-- FOOTER 👋 -->
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td align="center" style="padding-top: 42px;">
                                    <p class="footerText" style="margin-bottom: 64px;">
                                      If you were forwarded this newsletter and you like it, you
                                      can <a href="https://graphqlweekly.com/">subscribe here</a>.<br />If you don't want
                                      these updates anymore, you can
                                      <a href="*|UNSUB|*">unsubscribe here</a>. <br />
                                      <br />
                                      <div class="mailchimp">
                                        *|REWARDS|*
                                      </div>
                                      <br />
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
                <td class="sideSpace">&nbsp;</td>
              </tr>
            </table>
  
            <table border="0" cellpadding="0" cellspacing="0" class="wrapper">
              <tr>
                <td valign="top"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  

`;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
