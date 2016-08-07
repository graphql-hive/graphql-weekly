import React, {Component} from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import urlRegex from 'url-regex';

export default class Content extends Component {

    constructor(props) {
        super(props)
        this.state = {
            title: props.title,
            subtitle: this.getSubtitle(props.description),
            description: props.description,
            link: props.link,
            linkError: '',
            hasChanged: false
        }
    }

    handleDescChange = (e) => {
        this.setState({
            description: e.target.value,
            subtitle: this.getSubtitle(e.target.value),
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

    getSubtitle = (description) => {
        if (description.length >= 50) {
            return description.substring(0, 50) + '...'
        }
        return description
    }

    showChange = () => {
        if (this.state.hasChanged) {
            return (
                <RaisedButton
                    style={{
                        marginTop: '30px'
                    }}
                    fullWidth={true}
                    label={"Save Changes"}
                    primary={true}
                    onTouchTap={() => {
                        this.props.save(this.state)
                    }}
                />)
        }
    }

    render() {
        return (
            <Card>
                <CardHeader
                    style={{
                        textAlign: 'left',
                    }}
                    title={this.state.title}
                    subtitle={this.state.subtitle}
                    actAsExpander={true}
                    showExpandableButton={true}>
                </CardHeader>
                <CardText expandable={true}
                          style={{
                              textAlign: 'left',
                          }}>
                    <TextField
                        fullWidth={true}
                        floatingLabelText={"Title"}
                        value={this.state.title}
                        onChange={this.handleTitleChange}
                    />
                    <TextField
                        fullWidth={true}
                        floatingLabelText={"Description for " + this.state.title}
                        multiLine={true}
                        value={this.state.description}
                        onChange={this.handleDescChange}
                    />
                    <div>
                    <span>
                        <TextField
                            style={{
                                width: '70%'
                            }}
                            floatingLabelText={"Link"}
                            value={this.state.link}
                            onChange={this.handleLinkChange}
                            errorText={this.state.linkError}
                        />
                        <FlatButton
                            style={{
                                marginLeft: '5%',
                                width: '25%'
                            }}
                            label={"Go"}
                            primary={true}
                            onTouchTap={
                                () => {
                                    window.open(this.state.link)
                                }
                            }
                        />
                    </span>
                    </div>
                    {this.showChange()}
                </CardText>
            </Card>
        )
    }
}