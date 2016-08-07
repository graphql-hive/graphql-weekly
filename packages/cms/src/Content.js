import React, {Component} from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField'

export default class Content extends Component {

    constructor(props) {
        super(props)
        this.state = {
            title: props.title,
            subtitle: props.description.substring(0, 50) + '...',
            description: props.description
        }
    }

    handleDescChange = (e) => {
        this.setState({
            description: e.target.value,
            subtitle: e.target.value.substring(0, 50) + '...'
        })
    }

    handleTitleChange = (e) => {
        this.setState({
            title: e.target.value
        })
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
                </CardText>
            </Card>
        )
    }
}