import React, {Component} from 'react';
import logo from './logo.svg';
import Content from './Content'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './App.css';

class App extends Component {
    render() {
        return (
            <MuiThemeProvider>
                <div className="App">
                    <div className="App-header">
                        <img src={logo} className="App-logo" alt="logo"/>
                        <h2>Welcome to React</h2>
                    </div>
                    <div>
                        <Content title={"hello"} description={"Hello world! hoatunshoeatnsuhtnasooaeuheoatnsuh ansoethusoantehustnao hutaoehutnaseoh tnoehu teaonshu tnsaeoh unsteaohu.,rlchutoebku'.p,h euh r'.,uh seuh senotauh    21402chkbqjtnkh.',p7284 gpc,.hteonuh9321[0pcuoehtnuhaoesuhaoes"}>

                        </Content>
                    </div>
                </div>

            </MuiThemeProvider>
        );
    }
}

export default App;
