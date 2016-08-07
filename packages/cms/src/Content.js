import React, {Component} from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import {Card, CardText} from 'material-ui/Card';
import urlRegex from 'url-regex';
import {client} from './index';
import EditSheet from './EditSheet'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import TopicDialog from './TopicDialog'

export default class Content extends Component {

    constructor(props) {
        super(props)
        this.state = {
            title: props.link.title,
            description: props.link.text,
            link: props.link.url,
            linkError: '',
            hasChanged: false,
            expanded: false,
            open: false
        }
    }

    handleDescChange = (e) => {
        this.setState({
            description: e.target.value,
            hasChanged: true
        })
    }

    handleTitleChange = (e) => {
        this.setState({
            title: e.target.value,
            hasChanged: true
        })
    }

    handleLinkChange = (e) => {
        this.setState({
            link: e.target.value,
            linkError: urlRegex({exact: true}).test(e.target.value) ? '' : 'This is not a valid url',
            hasChanged: true
        })
    }

    onSave = () => {
        client.mutate(`{
          updateLink(id: "${this.props.link.id}", title: "${this.state.title}", text: "${this.state.description}",
           url: "${this.state.link}") {
            id
          }
        }`).then(() => {
            this.setState({
                expanded: false
            })
        })
    }

    handleExpandChange = () => {
        this.setState({expanded: !this.state.expanded});
    };

    showTopics = () => {
        this.setState({
            open: true
        })
    }

    render() {
        return (
            <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}
                  style={{
                      boxShadow: '0',
                      backgroundColor: '#F5F5F5',
                      marginTop: '5px'
                  }}>

                <Toolbar>
                    <ToolbarGroup style={{ overflow: 'hidden'}} >
                        <ToolbarTitle style={{color: 'black'}} text={this.state.title}/>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <FontIcon className="material-icons" onTouchTap={this.showTopics}>input</FontIcon>
                        <IconButton touch={true} onTouchTap={this.handleExpandChange}>
                            <NavigationExpandMoreIcon />
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>
                <TopicDialog open={this.state.open} topics={this.props.topics} linkId={this.props.linkId}
                    handleClose={() => {this.setState({open: false})}} refresh={this.props.refresh}
                />
                <CardText expandable={true}
                          style={{
                              textAlign: 'left',
                              backgroundColor: '#eee'
                          }}>
                    <EditSheet title={this.state.title} link={this.state.link} linkError={this.state.linkError}
                               hasChanged={this.state.hasChanged} description={this.state.description}
                        handlers={{handleTitleChange: this.handleTitleChange, handleDescChange: this.handleDescChange,
                        handleLinkChange: this.handleLinkChange, onSave: this.onSave}}
                    />
                </CardText>
            </Card>
        )
    }
}