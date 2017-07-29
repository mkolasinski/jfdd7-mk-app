import React from 'react'
import {connect} from 'react-redux'
import {Row, Col, Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {geolocated} from 'react-geolocated';
import {fetchPlaces} from '../state/places'
import {activateFilter} from '../state/activitiesFilter'
import {favPlace, deleteFav, initFavsSync} from '../state/favs'
import IconCategory from './IconCategory'
import Description from './Description'
import ContactObject from './ContactObject'
import './ListSearch.css'
import './SearchField.css'
import MenuFilter from './MenuFilter'
import distanceCalc from './distanceCalc'

export default connect(
  state => ({
    places: state.places,
    searchPhrase: state.searchField.searchPhrase,
    activeFilterNames: state.activitiesFilter.activeFilterNames,
    location: state.searchFilter.location,
    favedPlaceIds: state.favs.placeIds,
    user: state.auth.user

  }),
  dispatch => ({
    fetchPlaces: () => dispatch(fetchPlaces()),
    activateFilter: filterName => dispatch(activateFilter(filterName)),
    handleFavPlaceClick: event => dispatch(favPlace(event.target.dataset.uid)),
    handleDeletePlaceClick: event => dispatch(deleteFav(event.target.dataset.uid)),
    initFavsSync: () => dispatch(initFavsSync()),
  })
)(
  geolocated ({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 100,
  }
  )(
  class ListSearch extends React.Component {

    componentWillMount() {
      this.props.fetchPlaces()
    }

    render() {

      const {data} = this.props.places
      const places = data === null ? [] : data
      const filters = {
        fitness: place => place.functions.includes('fitness'),
        zajecia_dla_dzieci: place => place.functions.includes('zajęcia dla dzieci'),
        solarium: place => place.functions.includes('solarium'),
        sztuki_walki: place => place.functions.includes('sztuki walki'),
        masaz_wodny: place => place.functions.includes('masaż wodny'),
        zumba: place => place.functions.includes('zumba'),
        jacuzzi: place => place.functions.includes('jacuzzi'),
        basen: place => place.functions.includes('basen'),
        kregle: place => place.functions.includes('kręgle'),
        scianka_wspinaczkowa: place => place.functions.includes('ścianka wspinaczkowa'),
        taniec_towarzyski: place => place.functions.includes('taniec towarzyski'),
        sauna: place => place.functions.includes('sauna'),
        silownia: place => place.functions.includes('siłownia'),
        crossfit: place => place.functions.includes('crossfit')
      }
      const favoriteKeys = this.props.favedPlaceIds !== null ? Object.keys(this.props.favedPlaceIds) : []

      const checkString = string => string.toLowerCase().includes(this.props.searchPhrase.toLowerCase())
      const checkArray = functions => this.props.searchPhrase.toLowerCase().split(' ').every(phrase => functions.join(' ').toLowerCase().includes(phrase))

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
      ).filter(
        place => this.props.searchPhrase === '' && this.props.activeFilterNames.length === 0 ? true : checkString(place.name) || checkArray(place.functions)
      ).map(
        place => ({
          ...place,
          distance: distanceCalc(place.latitude, place.longitude, location.lat, location.lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .filter(place => place.distance <= this.props.location)

      return (
        <Row>
          <Col sm={4}>
            <MenuFilter/>
          </Col>
          <Col sm={8}>
              { filteredPlaces.length === 0 ? 'Brak wyników dla wybranych kryteriów' :
                filteredPlaces.map(
                  place => (
                    <Row key={place.id} className="info">
                      <Col xs={2} className="pin">
                        <div>
                          <IconCategory/>
                        </div>
                      </Col>
                      <Link to={'/details/' + place.id} key={place.id}>
                        <Col xs={10} sm={6} className="main-description">
                          <Description address={place.address} telephone={place.telephone} website={place.website}
                                       name={place.name} distance={place.distance}/>
                        </Col>
                      </Link>
                      <Col xs={10} xsOffset={2} smOffset={0} sm={4} className="contact">
                        <ContactObject telephone={place.telephone}/>
                        {this.props.user === null ? null :
                          <Button
                            className="addToFav"
                            data-uid={place.id}
                            onClick={!favoriteKeys.includes(place.id) ? this.props.handleFavPlaceClick : this.props.handleDeletePlaceClick}

                          >
                            {favoriteKeys.includes(place.id) ? '-' : '+'}
                          </Button>
                        }
                      </Col>
                    </Row>
                  )
                )
              }
          </Col>
        </Row>
      )
    }
  })
)