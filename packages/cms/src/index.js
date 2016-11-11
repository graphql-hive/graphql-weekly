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
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const headers = {
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0Nzg4Njk1NDAsImNsaWVudElkIjoiY2lvcTk1b2VjMDJrajAxbzBvbmpvcHBmOSIsInByb2plY3RJZCI6ImNpcGIxMTFwdzVmZ3QwMW8wZTdodngybGYiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNpdmRzcW9zMjBmMnEwMTQ1YnVlMDMzdzAifQ.bVe4_30gcPIqw-mbBxtRY7k3RAc_hyd0Dl_g5pB32JQ'
}

export const client = new Lokka({
    transport: new Transport('https://api.graph.cool/simple/v1/cipb111pw5fgt01o0e7hvx2lf', {headers})
});

const theme = getMuiTheme({
    palette: {
        primary1Color: "#00C853"
    }
})

injectTapEventPlugin();

ReactDOM.render(
    <MuiThemeProvider muiTheme={theme}>
        <Router history={browserHistory}>
            <Route path='/' component={LinkAdder}/>
            <Route path='/issue/:id' component={App}/>
        </Router>
    </MuiThemeProvider>,
    document.getElementById('root')
);
