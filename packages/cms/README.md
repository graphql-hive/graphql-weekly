# qlator - curator app for [GraphQL Weekly](https://graphqlweekly.com/).

## Curating workflow
The workflow to publish a new GraphQL Weekly issue for both the [homepage](https://graphqlweekly.com/) and the Mailchimp newsletter is as follows

### Create Issue, collect Links and draft the descriptions in the [qlator app](qlator.surge.sh)
* Collect links throughout the week. the `graphql` or `graphql relay` tags on [Twitter](http://twitter.com) and [Medium](http://medium.com) work well. Do not use links that are older than roughly two weeks without a good reason. Add new links to the Graphcool project on to the main page of qlator
* Create a new issue named `Issue 22` for example
* Create new topics in qlator for that issue, usually we use `Articles & Videos`, `Open Source` and `Community` (the latter only sometimes)
* Assign usually 5 or 6 links to these topics. Choose a good mix of different material.
* Edit the descriptions of the links. If the description should contain links in the end, **do not include the `<a href>` tag yet**.
* Click `Publish` to publish the links on [GraphQL Weekly](https://graphqlweekly.com/) and share the link with anyone who might want to proof read the newsletter.
* Work in feedback.

### Sort links and topics and add HTML tags in the [Graphcool dashboard](http://dashboard.graph.cool)

* An inconvenience at the moment is that including the `<a href>` tag in the description of a link doesn't work (see #2). That's why we have to edit the description of a link node in the Dashboard, if it should contain links to Twitter handles or similar in its description.

* We also have to set the `position` properties of topics and links to reach the desired order. Position 0 is the first element, then position 1 and so on.

### Create the Mailchimp email from inside the [qlator app](qlator.surge.sh)

* Once you're happy with the email, click `Create Email` on the issue page in the qlator app. If you closed the issue page tab before, you have to set `published` to `false` for this issue, otherwise you cannot open it (see #3).

### Send a test email and schedule it in [Mailchimp](http://mailchimp.com)

* Sign in to the Graphcool Mailchimp account and send a test email to yourself. Check that the order of the topics and links is correct and that the CSS works correct.
* If you're happy, schedule the email to be sent out on Friday, usually around 3 or 4 pm CET

### Announce the issue on [Twitter](http://twitter.com)

* Announce the twitter on the [GraphQL Weekly Twitter](https://twitter.com/graphqlweekly) account. Usually, we start tweets with an emoticon. Get inspiration from past tweets.
