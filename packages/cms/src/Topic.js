import React from 'react'
import Content from './Content'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'

export default class Topic extends React.Component {


    render() {
        return (
            <div style={{
                textAlign: 'left',
                marginBottom: '10px',
                backgroundColor: '#1AAF5D',
            }}>
                <Divider/>
                <Subheader style={{
                    fontSize: '1.2em',
                    color: 'white',
                }}>{this.props.topic.title}</Subheader>
                {this.props.topic.links.map((link, index) => <Content link={link} key={link.id} linkId={link.id}
                                                                      topics={this.props.topics} refresh={this.props.refresh}/>)}
            </div>
        )
    }
}