import React from 'react';
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import urlRegex from 'url-regex'
import {browserHistory} from 'react-router';
import {client} from './index'

export default class LinkAdder extends React.Component {

    constructor(props) {
        super(props)

        client.query(`
            {
              allIssues{
                id
                title
                published
              }
            }
        `).then(result => {
            this.setState({
                issues: result.allIssues
            })
        });

        this.state = {
            link: "",
            loading: false,
            linkError: "",
            issues: []
        }
    }

    handleChange = (e) => {
        this.setState({
            link: e.target.value,
            linkError: urlRegex({exact: true}).test(e.target.value) ? '' : 'This is not a valid url'
        })
    }

    submitChange = () => {
        this.setState({
            loading: true
        })
        client.mutate(`{ addLink:
        createLink(url:"${this.state.link}"){id}
      
    }`).then(() => {
            this.setState({
                loading: false,
                link: "",
                linkError: ""
            })
        }).catch(() => {
            this.setState({
                loading: false,
                link: "",
                linkError: "Error while submitting"
            })
        })
    }

    handleIssueChange = (e) => {
        this.setState({
            issue: e.target.value
        })
    }

    submitIssueChange = (e) => {
        this.setState({
            loading: true
        })
        client.mutate(`
        {
          createIssue(title: "${this.state.issue}", date:"${new Date().toISOString()}", published: false){id}
        }
        `).then(() => {
            location.reload()
        })
    }

    renderIssues() {
        return this.state.issues.map((issue) => {
            return (<FlatButton
                key={issue.id}
                label={issue.title}
                disabled={issue.published}
                onTouchTap={
                    () => {
                        browserHistory.push('/issue/' + issue.id)
                    }
                }
            />)
        })
    }

    render() {
        return (
            <div>
                <TextField
                    disabled={this.state.loading}
                    floatingLabelText={"Link"}
                    onChange={this.handleChange}
                    value={this.state.link}
                    errorText={this.state.linkError}
                />
                <FlatButton
                    disabled={this.state.loading || this.state.linkError !== ''}
                    label={"Add Link"}
                    onTouchTap={this.submitChange}
                />
                <div style={{
                    marginTop: '60px'
                }}>
                    {this.renderIssues()}
                </div>
                <TextField
                    disabled={this.state.loading}
                    floatingLabelText={"Issue Title"}
                    onChange={this.handleIssueChange}
                />
                <FlatButton
                    disabled={this.state.loading}
                    label={"Add Link"}
                    onTouchTap={this.submitIssueChange}
                />
            </div>)

    }
}