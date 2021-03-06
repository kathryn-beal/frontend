/*
Copyright (c) 2018 Genome Research Ltd.

Authors:
* Simon Beal <sb48@sanger.ac.uk>

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/


import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch
  } from 'react-router-dom';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom';
import rootReducer from './reducers/root.js';
import MainPage from './pages/main_page.js';
import DefaultPage from './pages/default_page.js';
import {fetchMe} from './actions/users'
import Header from './header.js';
import { connect } from 'react-redux';

import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

import './index.css';
import {fetchLatestRotation} from './actions/rotations.js';
import Projects from './pages/projects.js';
import MarkableProjects from './pages/markable_projects.js'
import EmailEditor from './pages/email_edit.js';
import UserEditor from './pages/user_edit.js';
import RotationCreate from './pages/rotation_create.js';
import ProjectCreate from './pages/project_create.js';
import ProjectResubmit from './pages/project_resubmit.js';
import ProjectEdit from './pages/project_edit.js';
import RotationCogsEditor from './pages/rotation_cogs_edit.js';
import RotationChoiceViewer from './pages/rotation_choices_view.js'
import RotationChoiceChooser from './pages/rotation_choices_finalise.js'
import RotationCogsFinalise from './pages/rotation_choices_cogs.js'
import ProjectUpload from './pages/project_upload'
import ProjectMark from './pages/project_mark'
import {ProjectFeedbackSupervisor, ProjectFeedbackCogs} from './pages/project_feedback'


const loggerMiddleware = createLogger()
const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware // lets us dispatch() functions
      //,loggerMiddleware // neat middleware that logs actions
    )
  )

class App extends Component {
    async componentDidMount() {
        store.dispatch(fetchMe());
        store.dispatch(fetchLatestRotation());
    }

    render() {
        if (!(this.props.loggedInID && this.props.latestRotationID)) {return ""}
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <Header/>
                        <Switch>
                            <Route exact path="/" component={MainPage}/>
                            <Route exact path="/projects" component={Projects}/>
                            <Route exact path="/projects/markable" component={MarkableProjects}/>
                            <Route exact path="/emails/edit" component={EmailEditor}/>
                            <Route exact path="/users/edit" component={UserEditor}/>
                            <Route exact path="/rotations/create" component={RotationCreate}/>
                            <Route exact path="/projects/create" component={ProjectCreate}/>
                            <Route exact path="/projects/upload" component={ProjectUpload}/>
                            <Route exact path="/projects/:projectID/resubmit" component={ProjectResubmit}/>
                            <Route exact path="/projects/:projectID/edit" component={ProjectEdit}/>
                            <Route exact path="/projects/:projectID/provide_feedback" component={ProjectMark}/>
                            <Route exact path="/projects/:projectID/supervisor_feedback" component={ProjectFeedbackSupervisor}/>
                            <Route exact path="/projects/:projectID/cogs_feedback" component={ProjectFeedbackCogs}/>
                            <Route exact path="/rotations/choices/cogs" component={RotationCogsFinalise}/>
                            <Route exact path="/rotations/choices/view" component={RotationChoiceViewer}/>
                            <Route exact path="/rotations/choices/finalise" component={RotationChoiceChooser}/>
                            <Route exact path="/rotations/:partID/cogs" component={RotationCogsEditor}/>
                            <Route component={DefaultPage} />
                        </Switch>
                        <Alert stack={{limit: 3}} effect="stackslide"/>
                    </div>
                </Router>
            </Provider>
        );
    }
}
    
const mapStateToProps = state => {
    return {
        loggedInID: state.users.loggedInID,
        latestRotationID: state.rotations.latestID
    }
};  

const mapDispatchToProps = dispatch => {return {}};

const ConnectedApp = connect(
    mapStateToProps,
    mapDispatchToProps
)(App)

ReactDOM.render(<ConnectedApp store={store}/>, document.getElementById('root'));
