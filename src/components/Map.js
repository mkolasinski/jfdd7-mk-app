import React, {Component} from 'react';
import {connect} from 'react-redux'
import GoogleMapReact from 'google-map-react';
import {fetchPlaces} from '../state/places'
import {activateFilter} from '../state/activitiesFilter'
import distanceCalc from './distanceCalc'
import {geolocated} from 'react-geolocated';
import './Map.css'
import MapPin from './MapPin'
import {filters} from './filters'

export default connect(
  state => ({
    places: state.places,
    searchPhrase: state.searchField.searchPhrase,
    activeFilterNames: state.activitiesFilter.activeFilterNames,
    location: state.searchFilter.location,
  }),
  dispatch => ({
    fetchPlaces: () => dispatch(fetchPlaces()),
    activateFilter: filterName => dispatch(activateFilter(filterName))
  })
)(
  geolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 100,
  }
  )(
  class Map extends Component {

    componentWillMount() {
      this.props.fetchPlaces()
    }


    render() {
      const {data} = this.props.places

      const places = data === null ? [] : data


      const checkString = string => string.toLowerCase().includes(this.props.searchPhrase.toLowerCase())
      const checkArray = functions =>
        this.props.searchPhrase
          .toLowerCase()
          .split(' ')
          .every(phrase =>
            functions.join(' ')
              .toLowerCase()
              .includes(phrase))

      const location = (this.props.isGeolocationAvailable && this.props.isGeolocationEnabled)
        ? this.props.coords
          ? {lat: this.props.coords.latitude, lng: this.props.coords.longitude}
          : null
        : {lat: 54.403351, lng: 18.569951}
      if (location === null) {
        return <div>Pobieram Twoją lokalizację</div>
      }

      const filteredPlaces = places.filter(
        place => this.props.activeFilterNames.map(
          filterName => filters[filterName] || (() => true)
        ).every(
          f => f(place) === true
        )
      ).filter(place => this.props.searchPhrase === '' ? true : checkString(place.name) || checkArray(place.functions)
      ).map(
        place => ({
          ...place,
          distance: distanceCalc(place.latitude, place.longitude, location.lat, location.lng)
        }))
        .filter(place => place.distance <= this.props.location)


      const pointBetween = latOrLng => (Math.max.apply(null, filteredPlaces.map(place => parseFloat(place[latOrLng]))) + Math.min.apply(null, filteredPlaces.map(place => parseFloat(place[latOrLng])))) / 2

      const searchCenterLat = pointBetween("latitude") || location.lat
      const searchCenterLng = pointBetween("longitude") || location.lng

      const zoomLvl = Math.max.apply(null, filteredPlaces.map(place => parseFloat(place['latitude']))) - Math.min.apply(null, filteredPlaces.map(place => parseFloat(place['latitude'])))
      const defaultProps = {
        center: filteredPlaces.length === 0 ? location :
          {
            lat: searchCenterLat,
            lng: searchCenterLng
          },
        zoom: filteredPlaces.length === 0 ? 14 : zoomLvl > 0 ? 12 : 14
      }

      return (
        <GoogleMapReact
          apiKey={'AIzaSyAJcR-ZM6KPN20sN1ECp89Jgi0hqJvQBho'}
          center={defaultProps.center}
          zoom={defaultProps.zoom}
        >
          <div className="im im-home"
          lat={location.lat}
          lng={location.lng}
          />

          {filteredPlaces.map(
            place => (
                <MapPin
                  lat={parseFloat(place.latitude)}
                  lng={parseFloat(place.longitude)}
                  place={place}
                />
            ))}

        </GoogleMapReact>
      );
    }
  }))