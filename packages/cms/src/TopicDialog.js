import React from 'react'
import {client} from './index'
import FlatButton from 'material-ui/FlatButton'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import Dialog from 'material-ui/Dialog'

const styles = {
    radioButton: {
        marginTop: 16,
    },
};

export default class TopicDialog extends React.Component {

    constructor(props) {
        super(props);
        console.log(this.props.open)
        this.state = {
            topicId: '',
            open: this.props.open
        }
    }

    handleClick = () => {
        client.mutate(`{
            addToLinksOnTopic(topicTopicId:"${this.state.topicId}", linksLinkId:"${this.props.linkId}"){id}
        }`).then(() => {
            this.props.refresh()
            this.props.handleClose()
        })
    }


    getRadios = () => {
        const radios = []
        for (let i = 0; i < this.props.topics.length; i++) {
            const topic = this.props.topics[i]
            radios.push(
                <RadioButton
                    key={i}
                    value={topic.id}
                    label={topic.title}
                    style={styles.radioButton}
                />
            )
        }
        return radios
    }

    handleChange = (e, value) => {
        this.setState({
            topicId: value
        })
    }

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.props.handleClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClick}
            />,
        ];

        return (
            <Dialog
                title="Scrollable Dialog"
                actions={actions}
                modal={true}
                open={this.props.open}
                onRequestClose={this.props.handleClose}
                autoScrollBodyContent={true}
            >
                <RadioButtonGroup name="Topics" onChange={this.handleChange}>
                    {this.getRadios()}
                </RadioButtonGroup>
            </Dialog>
        )
    }
}