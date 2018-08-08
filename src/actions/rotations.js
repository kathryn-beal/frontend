import axios from 'axios';
import api_url from '../config.js';
import update from 'immutability-helper';


export const FETCH_ROTATIONS = 'FETCH_ROTATIONS';
export const REQUEST_ROTATIONS = 'REQUEST_ROTATIONS';
export const RECEIVE_ROTATION = 'RECEIVE_ROTATION';

export const FETCH_LATEST_ROTATION = 'FETCH_LATEST_ROTATION';
export const REQUEST_LATEST_ROTATION = 'REQUEST_LATEST_ROTATION';
export const RECEIVE_LATEST_ROTATION = 'RECEIVE_LATEST_ROTATION';

function requestRotations(noRotations) {
    return {
        type: REQUEST_ROTATIONS,
        noRotations
    }
}

function receiveRotation(rotation) {
    return {
        type: RECEIVE_ROTATION,
        rotation
    }
}

function requestLatestRotation() {
    return {
        type: REQUEST_LATEST_ROTATION,
    }
}

function receiveLatestRotation(rotationID) {
    return {
        type: RECEIVE_LATEST_ROTATION,
        rotationID
    }
}

export function fetchLatestRotation() {
    return function (dispatch) {
        dispatch(requestRotations(1));
        dispatch(requestLatestRotation());
        axios.get(`${api_url}/api/series/latest`).then(response => {
            const rotation = response.data;
            dispatch(receiveRotation(rotation));
            dispatch(receiveLatestRotation(rotation.data.id));
        });
    }
}

export function saveRotation(rotation) {
    return function (dispatch, getState) {
        const state = getState();
        const stateRotation = state.rotations.rotations[rotation.id];
        const updatedState = update(stateRotation, {
            data: {deadlines: deadlines => Object.keys(deadlines).reduce((prev, name) => {
                prev[name] = update(deadlines[name], {$merge: {value: rotation.deadlines[name]}});
                return prev;
            }, {})}
        });
        axios.put(`${api_url}/api/series/${updatedState.data.series}/${updatedState.data.part}`, rotation["deadlines"]).then(response => {
            dispatch(receiveRotation(updatedState));
        });
    }
}