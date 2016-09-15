var mcapi = require('mailchimp-api')
var urlParser = require('url')

var mailchimpKey = "MAILCHIMP_API_KEY_REDACTED"
var mailchimpListId = "0792cc8e13"

var mc = new mcapi.Mailchimp(mailchimpKey);

module.exports = function (context, cb) {
  console.log(context)
  var shouldRun =
    context.data.updatedNode &&
    context.data.updatedNode.published === true &&
    context.data.changedFields.filter(function(x){ return x === "versionCount"}).length === 1

  if (!shouldRun){
    console.log("abort")
    cb(null, "aborted")
  } else {

  var updatedNode = context.data.updatedNode

  mc.campaigns.create({
    options: {
      list_id:mailchimpListId,
      subject: `GraphQL Weekly - ${updatedNode.title}`,
      from_email: "hello@graphqlweekly.com",
      from_name: "GraphQL Weekly",
      inline_css: true,
      title: `GraphQL Weekly - ${updatedNode.title} (version ${updatedNode.versionCount})`
    },
    content: {
      html:formatTemplate(updatedNode)
    },
    type: "regular"
  },
    function(success){
      var campaignId = success.id

      cb(null, "success")
      // mc.campaigns.send({cid: campaignId},
      //   function(success){
      //     cb(null, "success")
      //   },
      //   function(error){
      //     console.log(error)
      //     cb(null, "error")
      //   })
    },
    function(error){
      console.log(error)
      cb(null, "error")
    })
  }
}

function formatTemplate(updatedNode) {

  function formatTopic (topicName) {
    return `<div class="topic" mc:repeatable="block" mc:variant="topic">
      <div class="line"></div>
      <div class="category" mc:edit="article_topic">${topicName}</div>
    </div>`
  }

  function formatLink (title, text, url) {
    var host = urlParser.parse(url).hostname

    return `<div class="article" mc:repeatable="block" mc:variant="article">
      <div class="article_headline" mc:edit="article_title"><a href="${url}">${title}</a></div>
      <p mc:edit="article_content">
        ${text}
        <br>
        <em><a href="${url}">${host}</a></em>
      </p>
    </div>`
  }

  var content = updatedNode.topics.map(function(topic){
    return formatTopic(topic.title) + topic.links.map(function(link){
      return formatLink(link.title, link.text, link.url)
    }).join("")
  }).join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>*|MC:SUBJECT|*</title>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400italic,600,600italic,700,800,700italic,800italic,300,300italic,400" rel="stylesheet" type="text/css">

<style type="text/css">
    #outlook a{
      padding:0;
    }
    .ReadMsgBody{
      width:100%;
    }
    .ExternalClass{
      width:100%;
    }
    .ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{
      line-height:100%;
    }
    body,table,td,p,a,li,blockquote{
      -webkit-text-size-adjust:100%;
      -ms-text-size-adjust:100%;
    }
    table,td{
      mso-table-lspace:0pt;
      mso-table-rspace:0pt;
    }
    img{
      -ms-interpolation-mode:bicubic;
    }
    body{
      margin:0;
      padding:0;
    }
    img{
      border:0;
      height:auto;
      line-height:100%;
      outline:none;
      text-decoration:none;
    }
    table{
      border-collapse:collapse !important;
    }
    body,#bodyTable,#bodyCell{
      height:100% !important;
      margin:0;
      padding:0;
      width:100% !important;
    }
    html{
      font-size:20px;
    }
    body{
      font-family:'opensans', Helvetica, Arial, Verdana, Trebuchet MS;
      background-color:#ffffff;
    }
    a{
      text-decoration:none;
    }
    .container{
      background-color:#ffffff;
      max-width:700px;
      margin:0 auto;
    }
    .header{
      text-align:center;
      padding-top:50px;
    }
    .title{
      padding-top:14px;
      color:#777E9B;
      font-size:16px;
    }
    .subtitle{
      text-align:center;
    }
    .subtitle p{
      color:#424242;
      font-size:19px;
      padding:30px 20px 52px;
    }
    .subtitle a{
      color:#777E9B;
      width:160px;
      border:solid 2px #777E9B;
      margin-left:auto;
      margin-right:auto;
      padding:10px 0;
      display:inline-block;
      font-size:16px;
      text-transform:uppercase;
    }
    .topic{
      text-align:center;
      color:#424242;
    }
    .line{
      height:2px;
      width:80%;
      background-color:#E4E8ED;
      margin:60px auto 0;
    }
    .category{
      color:#424242;
      font-size:18px;
      margin-top:60px;
      text-transform:uppercase;
    }
    .article{
      padding:0 50px;
    }
    .article_headline{
      color:#E535AB;
      font-size:20px;
      font-weight:600;
      margin-top:60px;
      display:block;
    }
    .article_headline a{
      color:#E535AB;
    }
    .article p{
      font-size:16px;
      color:#424242;
      line-height:30px;
      margin-top:10px;
    }
    .article p a{
      color:#E535AB;
      font-weight:600;
    }
    .article p em{
      color:#B6B7C1;
      font-size:12px;
      margin-top:20px;
      text-transform:uppercase;
      display:block;
      font-style:normal;
    }
    .footer{
      background-color:#A3ADBA;
      color:#fff;
      text-align:center;
      width:100%;
      margin-top:100px;
      padding:50px 0;
    }
    .buttons{
      margin:30px auto;
      padding:0 20px;
    }
    .buttons a{
      display:inline-block;
      width:184px;
      border:solid 1px #fff;
      padding:12px 0;
      color:#fff;
      margin:5px;
      font-size:16px;
    }
    .footertitle{
      padding:0 20px;
      font-size:16px;
    }
    .footertitle2{
      margin:0 50px;
      font-size:12px;
      padding:0 20px;
    }
    .footertitle2 a{
      text-decoration:underline;
      color:#fff;
    }
    .mailchimp{
      margin-top:30px;
    }
    .mailchimp img{
      width:50px;
      height:auto;
    }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <a href="http://graphqlweekly.com"><img src="http://i.imgur.com/o7xBv5l.png" alt=""></a>
      <div class="title">*|MC:SUBJECT|*</div>
    </div>
    <div class="subtitle">
      <p>A weekly newsletter of the best news, articles and<br>projects about GraphQL, Relay and more.</p>
      <a href="*|LIST:URL|*" target="_blank">Read online</a>
    </div>

    <div class="content">
      ${content}
    </div>
  </div>

  <div class="footer">
    <div class="footertitle">Do you enjoy receiving this?</div>
    <div class="buttons">
      <a href="https://twitter.com/graphqlweekly">Follow on Twitter</a>
    </div>
    <div class="footertitle2">
      If you were forwarded this newsletter and you like it, you can subscribe <a href="http://graphqlweekly.com">here</a>. <br>
      If you don't want these updates anymore, you can <a href="*|UNSUB|*" target="_blank">unsubscribe</a>.
    </div>
    <div class="mailchimp">
      *|REWARDS|*
    </div>
  </div>
</body>
</html>
`
}
