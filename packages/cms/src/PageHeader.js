import React from 'react'
import {client} from './index'
import './PageHeader.css'

export default class PageHeader extends React.Component {

    constructor(props) {
        super(props)

        client.query(`{
            Issue(id: "${this.props.id}") {
                title
            }
        }`).then((result) => this.setState({title: result.Issue.title}))

        this.state = {
            title: ''
        }
    }

    handlePublish = () => {
        client.mutate(`{
            updateIssue(id: "${this.props.id}", published: true) { id }
        }`)
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
                    width: '80%',
                    display: 'inline-block',
                    backgroundColor: '#424242'
                }}>
                    Curating: <span style={{
                        fontWeight: '900'
                    }}>{this.state.title}</span>
                </div>

                <div style={{}} onClick={this.handlePublish} className="publish">
                    <div style={{
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        Publish
                    </div>
                </div>
            </div>
        )
    }
}