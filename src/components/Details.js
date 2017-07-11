import React from 'react'
import { connect } from 'react-redux'
import {
  Row,
  Col,
  Grid,
  Image
} from'react-bootstrap'
import {Link} from 'react-router-dom'
import { fetchPlaces } from '../state/places'
import CarouselDetails from './CarouselDetails'
import Foto from './Foto'
import ObjectName from './ObjectName'
import ObjectDetails from './ObjectDetails'
import MapDetails from './MapDetails'


export default connect (
  state => ({
    places: state.places
  }),
  dispatch => ({
    fetchPlaces: () => dispatch(fetchPlaces())
  })
)(
class Details extends React.Component {
  componentWillMount() {
    this.props.fetchPlaces()
  }


  render() {
    const { data } = this.props.places
    const placeId = parseInt(this.props.match.params.placeId, 10)
    const place = data === null ? undefined :data.find(
      place => place.id === placeId
    )

    if (place === undefined) {
      return (
        <div>
          <h1>Not found yet...</h1>
        </div>
      )
    }

        return (
            <Grid>
            <Row>
                <Col>
                    <Row>
                        <CarouselDetails/>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ObjectName name={place.name}/>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <ObjectDetails address={place.address} telephone={place.telephone} mail={place.mail}
                                   website={place.website}/>
                </Col>
                <Col md={6}>

                    <Row>
                        <div style={{width:'100%', height: 250}}>
                            <MapDetails name={place.name} latitude={parseFloat(place.latitude)} longitude={parseFloat(place.longitude)}/>
                        </div>
                    </Row>
                </Col>

            </Row>

            </Grid>
        )
    }
}
)



