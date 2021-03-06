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
import { connect } from 'react-redux';
import update from 'immutability-helper';
import Alert from 'react-s-alert';
import {fetchProjects, saveCogsMarkers} from '../actions/projects';
import {fetchRotation} from '../actions/rotations';
import CogsEditor from '../components/cogs_edit.js';

class RotationCogsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cogsMarkers: {}
        }
    }

    async componentDidMount() {
        document.title = "Edit CoGS Markers";
        const part = parseInt(this.props.match.params.partID, 10);
        this.fetchRotation(part);
    }

    componentDidUpdate() {
        const part = parseInt(this.props.match.params.partID, 10);
        if (part !== this.state.part) {
            this.fetchRotation(part);
        }
    }

    fetchRotation(part) {
        const latest = this.props.rotations[this.props.latest].data;
        const series = latest.series;
        this.setState(update(this.state, {part: {$set: part}}));
        this.props.fetchProjects(series, part);
        this.props.fetchRotation(series, part);
    }

    save() {
        this.props.saveCogsMarkers(this.state.cogsMarkers, () => {
            Alert.info("Saved CoGS markers.");
        });
    }

    setCogsMarker(projectID, userID) {
        this.setState(update(this.state, {
            cogsMarkers: {$merge: {[projectID]: userID}}
        }));
    }

    render() {
        const latest = this.props.rotations[this.props.latest].data;
        const series = latest.series;
        const part = parseInt(this.props.match.params.partID, 10);
        const rotation = Object.values(this.props.rotations).find(r => r.data.series === series && r.data.part === part );
        if (!rotation) {
            return null;
        }
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            const groupID = this.props.projects[id].data.group_id;
            const currentRotation = this.props.rotations[groupID].data;
            if (currentRotation.series === series && currentRotation.part === part && this.props.projects[id].data.student_id !== null) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(projects).length === 0) {
            text = "There are no projects in this rotation";
        }
        return (
            <div className="container-fluid">
                {text}
                <CogsEditor 
                    projects={projects}
                    cogsMarkers={this.state.cogsMarkers}
                    setCogsMarker={(projectID, userID) => this.setCogsMarker(projectID, userID)}
                    key={part}
                />
                <div className="row">
                    <div className="col-xs-6 col-sm-4">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => this.save()}>Save Changes</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        rotations: state.rotations.rotations,
        fetching: state.projects.fetching,
        projects: state.projects.projects,
        latest: state.rotations.latestID
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part)),
        fetchRotation: (series, part) => dispatch(fetchRotation(series, part)),
        saveCogsMarkers: (project_user_map, callback) => dispatch(saveCogsMarkers(project_user_map, callback))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationCogsEditor);