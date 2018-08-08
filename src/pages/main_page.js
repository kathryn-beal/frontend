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
import GroupEditor from './group_editor';
import { connect } from 'react-redux';
import {fetchLatestSeries, saveRotation} from '../actions/rotations';


class MainPage extends Component {
    async componentDidMount() {
        document.title = "Dashboard";
        this.props.fetchLatestSeries();
    }

    renderRotations() {
        return Object.values(this.props.rotations).sort(rotation => rotation.data.part).map(rotation =>
            <GroupEditor
                key = {rotation.data.part}
                user = {this.props.user}
                group = {rotation}
                onSave = {this.props.saveRotation}
            />
        );
    }

    render() {
        if (this.props.user === null) {
            return "";
        }
        return (
            <div className="container">
                <h4>Welcome, {this.props.user.name}</h4>
                <div className="clearfix"></div>
                {this.props.user.permissions.create_project_groups && this.renderRotations()}
            </div>
        );
    }
}

const mapStateToProps = state => {
    if (state.users.loggedInID === null || state.rotations.latestID === null) {
        return {
            user: null,
            rotation: null
        }
    }
    const allRotations = state.rotations.rotations
    const latestSeries = allRotations[state.rotations.latestID].data.series;
    const rotations = Object.keys(allRotations).reduce((filtered, id) => {
        if (allRotations[id].data.series === latestSeries) {
            filtered[id] = allRotations[id];
        }
        return filtered;
    }, {});

    return {
        user: state.users.users[state.users.loggedInID].data,
        rotations
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        saveRotation: rotation => dispatch(saveRotation(rotation)),
        fetchLatestSeries: () => dispatch(fetchLatestSeries())
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainPage);