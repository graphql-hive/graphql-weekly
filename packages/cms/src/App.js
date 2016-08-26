import React, {Component} from 'react';
import Content from './Content'
import {client} from './index'
import Topic from './Topic'
import './App.css';
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import List from 'material-ui/List'
import PageHeader from './PageHeader'

class App extends Component {

    constructor(props) {
        super(props)
        this.refreshEverything()
        this.state = {
            unassignedLinks: [],
            topics: []
        }
    }

    refreshEverything = () => {
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
            Issue(id:"${this.props.params.id}"){
                title
                topics (orderBy: position_ASC) {
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
        }`).then(() => {
                this.setState({loading: false, newTopic: ''})
                this.refreshEverything()
            }
        )
    }

    render() {
        return (
            <div className="App">
                <PageHeader id={this.props.params.id}/>
                <div style={{
                    marginTop: '25px'
                }}>
                    <div style={{
                        width: '45%',
                        float: 'left',
                        marginLeft: '4%'
                    }}>
                        {this.state.unassignedLinks.map((link) => <Content link={link} key={link.id}
                                                                           topics={this.state.topics}
                                                                           linkId={link.id} refresh={this.refreshEverything}/>)}
                    </div>

                    <List style={{
                        width: '45%',
                        float: 'right',
                        marginRight: '4%'
                    }}>
                        {this.state.topics.map((topic, index) =>
                            <Topic key={topic.id} topic={topic} topics={this.state.topics} refresh={this.refreshEverything}/>
                        )}
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
                    </List>
                </div>
            </div>

        );
    }
}
export default App;
