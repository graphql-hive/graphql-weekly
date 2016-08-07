import React from 'react'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class EditSheet extends React.Component {

    showChange = () => {
        if (this.props.hasChanged) {
            return (
                <RaisedButton
                    style={{
                        marginTop: '30px'
                    }}
                    fullWidth={true}
                    label={"Save Changes"}
                    primary={true}
                    onTouchTap={this.props.handlers.onSave}
                />)
        }
    }

    render() {
        return (
            <div>
                <TextField
                    fullWidth={true}
                    floatingLabelText={"Title"}
                    value={this.props.title}
                    onChange={this.props.handlers.handleTitleChange}
                />
                <TextField
                    fullWidth={true}
                    floatingLabelText={"Description for " + this.props.title}
                    multiLine={true}
                    value={this.props.description}
                    onChange={this.props.handlers.handleDescChange}
                />
                <div>
                    <span>
                        <TextField
                            style={{
                                width: '70%'
                            }}
                            floatingLabelText={"Link"}
                            value={this.props.link}
                            onChange={this.props.handlers.handleLinkChange}
                            errorText={this.props.linkError}
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
                                    window.open(this.props.link)
                                }
                            }
                        />
                    </span>
                </div>
                {this.showChange()}
            </div>
        )
    }
}