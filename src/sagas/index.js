import { fork, take, put, call, join } from 'redux-saga/effects';
import * as types from '../constants/actions';
import * as SpotifyActions from '../actions';
import axios from 'axios'

function* fetchTracks(item, token){
  yield put({type: types.REQUEST_ITEM, item})
  
  return yield axios.get(`https://api.spotify.com/v1/search?q=${item}&type=track`, {
    headers :{ 'Authorization': 'Bearer ' + token, }
  })
    .then(response => response.data)
    .then(res => res.tracks.items.map(item => ({
      id: item.id,
      name: item.name,
      artists: item.artists[0].name  
    })))
}

function* fetchAlbums(item, token) {
  yield put({type: types.REQUEST_ITEM, item})

  return yield axios.get(`https://api.spotify.com/v1/search?q=${item}&type=album`, {
    headers: { 'Authorization': 'Bearer ' + token, }
  })
    .then(response => response.data)
    .then(res => res.albums.items.map(item => ({
      id: item.id,
      name: item.name,
      artist: item.artists[0].name,
      image: item.images[1]
    })))
    .catch(err => {
      console.log(err)
    })
}

function* fetchArtists(item, token) {
  yield put({type: types.REQUEST_ITEM, item})
 
  return yield axios.get( `https://api.spotify.com/v1/search?q=${item}&type=artist`, {
    headers: { 'Authorization': 'Bearer ' + token, }
  })
    .then(response => response.data)
    .then(res => res.artists.items.map(item => ({
      id: item.id,
      name: item.name,
      image: item.images[1]
    })))
    .catch(err => {
      console.log(err)
    })
}

function mergeFetchedData(artists, albums, tracks){
  return {
    artists: artists,
    albums: albums,
    tracks: tracks
  }
}

function* fetchData(searchedItem, token) {
  let setArtists = yield call(fetchArtists, searchedItem, token);
  let setAlbums = yield call(fetchAlbums, searchedItem, token);
  let setTracks = yield call(fetchTracks, searchedItem, token);
  
  let parsedItems = mergeFetchedData(setArtists, setAlbums, setTracks)
  console.log(parsedItems)
  yield put({type: types.RECEIVE_ITEM, item: searchedItem, itemData: parsedItems})
}

function* apiFlow() {
  while(typeof x === 'undefined') {
    const {searchedItem, token} = yield take(types.FETCH_DATA);
    yield fork(fetchData, searchedItem, token);
  }
}

export default function* rootSaga(cable) {
  yield fork(apiFlow);
}