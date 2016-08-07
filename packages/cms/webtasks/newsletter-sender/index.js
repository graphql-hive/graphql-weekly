var mcapi = require('mailchimp-api')
var urlParser = require('url')

var mailchimpKey = "f3a7f873a8c8066589f3484cabc8897f-us1"
var mailchimpListId = "4f4e60c9c1"

var mc = new mcapi.Mailchimp(mailchimpKey);

module.exports = function (context, cb) {
  console.log(context)
  var shouldRun = 
    context.data.updatedModel.published === true &&
    context.data.updatedFields.filter(function(c){ return x === "published"}).length === 1

  if (!shouldRun){
    cb(null, "aborted")
  }

  var updatedModel = context.data.updatedModel

  mc.campaigns.create({
    options: {
      list_id:mailchimpListId,
      subject: "The Weekly",
      from_email: "sorenbs@gmail.com",
      from_name: "Bramer Weekly"
    },
    content: {
      html:formatTemplate(updatedModel)
    },
    type: "regular"
  },
    function(success){
      var campaignId = success.id

      mc.campaigns.send({cid: campaignId},
        function(success){
          cb(null, "success")
        },
        function(error){
          console.log(error)
          cb(null, "error")
        })
    },
    function(error){
      console.log(error)
      cb(null, "error")
    })

}

// var updatedModel = {
//   "title": "Issue 14",
//   "topics": [
//     {
//       "title": "Articles & Videos",
//       "links": [
//         {
//           "title": "Relay: State of the State",
//           "text": "These are super exciting news about the state of Relay. Joseph Savona summarizes the advancements in Relay over the last few months and gives an overview of what's next in Relay such as a performance-optimized core and more expressive mutations. Oh yes!",
//           "url": "https://facebook.github.io/react/blog/2016/08/05/relay-state-of-the-state.html"
//         },
//         {
//           "title": "Versioning an API in GraphQL vs. REST",
//           "text": "This article shows the benefits of using GraphQL compared to REST when it comes to API versioning. The following quote nails it: \"If you dig out that old iPhone 3GS from your top drawer and fire up the Facebook client, it will likely still work. This is because it already used GraphQL and while there have been plenty changes to the API, the client requests have stayed the same.\"",
//           "url": "https://www.symfony.fi/entry/versioning-an-api-in-graphql-vs-rest"
//         },
//         {
//           "title": "Modernize your Angular apps with GraphQL",
//           "text": "Uri Goldshtein (or ng-jesus - just kidding...) gives an extensive introduction to GraphQL and how to use it inside your Angular applications using the Apollo client. Definitely check out this video if you're using Angular and are still uncertain whether you'd want to use GraphQL or not.",
//           "url": "https://www.youtube.com/watch?v=qpGnPbpkcZM"
//         }
//       ]
//     },
//     {
//       "title": "Community",
//       "links": [
//         {
//           "title": "Your GraphQL talk at React London",
//           "text": "The React London meetup is currently looking for speakers about GraphQL. Maybe that's something for you?",
//           "url": "https://twitter.com/ReactLondon_/status/761533501250437120"
//         }
//       ]
//     },
//     {
//       "title": "Open Source",
//       "links": [
//         {
//           "title": "folkloreatelier/laravel-graphql",
//           "text": "Laraval is one of the most popular PHP frameworks out there and it's now easier than ever to expose your data through a GraphQL API using the laravel-graphql module based on the PHP GraphQL implementation.",
//           "url": "https://github.com/Folkloreatelier/laravel-graphql"
//         },
//         {
//           "title": "jwerle/three.graphql",
//           "text": "This is probably the most creative use case of GraphQL so far. Joseph Werle created a little tool that let's you build and render ThreeJS scenes using GraphiQL. Absolutely brilliant!",
//           "url": "https://github.com/jwerle/three.graphql"
//         }
//       ]
//     }
//   ]
// }



function formatTemplate(updatedModel) {

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

  var content = updatedModel.topics.map(function(topic){
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