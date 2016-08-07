import React, {Component} from 'react';
import logo from './logo.svg';
import Content from './Content'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './App.css';

class App extends Component {

    handleChange = (content) => {

    }

    render() {
        return (
            <MuiThemeProvider>
                <div className="App">
                    <div className="App-header">
                        <h2>Welcome to React</h2>
                    </div>
                    <div style={{
                        width: '50%',
                        float: 'left'
                    }}>
                        <Content title={"hello"} link={"http://www.google.com"}
                                 description={"Hello world! hoatunshoeatnsuhtnasooaeuheoatnsuh ansoethusoantehustnao hutaoehutnaseoh tnoehu teaonshu tnsaeoh unsteaohu.,rlchutoebku'.p,h euh r'.,uh seuh senotauh    21402chkbqjtnkh.',p7284 gpc,.hteonuh9321[0pcuoehtnuhaoesuhaoes"}
                        save={this.handleChange}>
                        </Content>
                    </div>

                    <div style={{
                        width: '50%',
                        float: 'right'
                    }}>
                        <Content title={"hello"} link={"http://www.google.com"}
                                 description={"Hello world! hoatunshoeatnsuhtnasooaeuheoatnsuh ansoethusoantehustnao hutaoehutnaseoh tnoehu teaonshu tnsaeoh unsteaohu.,rlchutoebku'.p,h euh r'.,uh seuh senotauh    21402chkbqjtnkh.',p7284 gpc,.hteonuh9321[0pcuoehtnuhaoesuhaoes"}
                                 save={this.handleChange}>
                        </Content>
                    </div>
                </div>

            </MuiThemeProvider>
        );
    }
}
export default App;
