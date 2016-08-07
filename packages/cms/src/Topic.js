import React from 'react'
import Content from './Content'

export default class Topic extends React.Component {
    render() {
        return (
            <div>
                <h1>{this.props.topic.title}</h1>
                {this.props.topic.links.map((link) => <Content link={link} key={link.id}/>)}
            </div>
        )
    }
}