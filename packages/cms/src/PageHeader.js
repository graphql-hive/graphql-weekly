import React from 'react'
import {client} from './index'
import './PageHeader.css'

export default class PageHeader extends React.Component {

    constructor(props) {
        super(props)

        client.query(`{
            Issue(id: "${this.props.id}") {
                title
                versionCount
            }
        }`).then((result) => this.setState({
          title: result.Issue.title,
          versionCount: result.Issue.versionCount
        }))

        this.state = {
            title: '',
            versionCount: 0
        }
    }

    handlePublish = () => {
        client.mutate(`{
            updateIssue(id: "${this.props.id}", published: true) { id }
        }`)
    }

    increaseVersion = () => {
      client.mutate(`{
        updatedIssue: updateIssue(id: "${this.props.id}", versionCount: "${this.state.versionCount}") {
          id,
          versionCount
        }
      }`).then(result => {
        this.setState({versionCount: result.updatedIssue.versionCount})
      })
    }

    render() {
        return (
            <div style={{
                width: '100vw',
                fontSize: '1.5em',
                textAlign: 'left',
                color: 'white',
                fontFamily: 'monospace'
            }}>
                <div style={{
                    padding: '2%',
                    width: '60%',
                    display: 'inline-block',
                    backgroundColor: '#424242'
                }}>
                    Curating: <span style={{
                        fontWeight: '900'
                    }}>{this.state.title}</span> (version {this.state.versionCount})
                </div>

                <div style={{}} onClick={this.handlePublish} className="publish">
                    <div style={{
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        Publish
                    </div>
                </div>
                <div style={{}} onClick={this.increaseVersion} className="publish">
                    <div style={{
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        Create Email
                    </div>
                </div>
            </div>
        )
    }
}
