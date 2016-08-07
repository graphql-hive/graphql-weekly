import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, browserHistory}from 'react-router'
import App from './App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LinkAdder from './LinkAdder'
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Lokka} from 'lokka';
import {Transport} from 'lokka-transport-http';

export const client = new Lokka({
    transport: new Transport('https://api.graph.cool/simple/v1/cipb111pw5fgt01o0e7hvx2lf')
});

injectTapEventPlugin();

ReactDOM.render(
    <MuiThemeProvider>
        <Router history={browserHistory}>
            <Route path='/' component={LinkAdder}/>
            <Route path='/issue/:id' component={App}/>
        </Router>
    </MuiThemeProvider>,
    document.getElementById('root')
);
