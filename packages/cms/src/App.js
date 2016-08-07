import React, {Component} from 'react';
import Content from './Content'
import {client} from './index'
import Topic from './Topic'
import './App.css';
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'

class App extends Component {

    constructor(props) {
        super(props)
        client.query(`{
            allLinks {
                topic {
                    id
                }
                url
                text
                title
                id
            }
        }`).then((result) => {
            this.setState({
                unassignedLinks: result.allLinks.filter((link) => link.topic === null)
            })
        })

        client.query(`{
            Issue(id:"cirkrzrix19oi0190g27zvqh1"){
                title
                topics{
                  id
                  title
                  links{
                    title
                    text
                    url
                    id
                  }
                }
              }
        }`).then((result) => {
            this.setState({
                topics: result.Issue.topics
            })
        })

        this.state = {
            unassignedLinks: [],
            topics: []
        }
    }

    handleTopicChange = (e) => {
        this.setState({
            newTopic: e.target.value
        })
    }

    submitTopic = () => {
        this.setState({
            loading: true
        })
        client.mutate(`{
          createTopic(issue_comment:" " title:"${this.state.newTopic}", issueId:"${this.props.params.id}"){id}
        }`).then(() => this.setState({loading: false, newTopic: ''}))
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>{this.props.params.id}</h2>
                </div>
                <div style={{
                    width: '50%',
                    float: 'left'
                }}>
                    {this.state.unassignedLinks.map((link) => <Content link={link} key={link.id}/>)}
                </div>

                <div style={{
                    width: '50%',
                    float: 'right'
                }}>
                    {this.state.topics.map((topic) => <Topic key={topic.id} topic={topic}/>)}
                    <TextField
                        disabled={this.state.loading}
                        floatingLabelText={"Topic Title"}
                        value={this.state.newTopic}
                        onChange={this.handleTopicChange}
                    />
                    <FlatButton
                        disabled={this.state.loading}
                        label={"Add Topic"}
                        onTouchTap={this.submitTopic}
                    />
                </div>
            </div>

        );
    }
}
export default App;
