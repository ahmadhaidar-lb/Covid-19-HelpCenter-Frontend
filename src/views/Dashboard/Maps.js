import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import React, { Component } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import { Button, ButtonGroup } from 'reactstrap';
import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts.js";

import authSvg from '../../assests/update.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
const useStyles = makeStyles(styles);


export default class Requests extends Component {
  constructor(props) {
    super(props);
    this.state={
      user:[]
    }
    console.log(props.longitude)

  }


  //Haversine formula
  calculateDistance(lat1, long1, lat2, long2) {

    //radians
    lat1 = (lat1 * 2.0 * Math.PI) / 60.0 / 360.0;
    long1 = (long1 * 2.0 * Math.PI) / 60.0 / 360.0;
    lat2 = (lat2 * 2.0 * Math.PI) / 60.0 / 360.0;
    long2 = (long2 * 2.0 * Math.PI) / 60.0 / 360.0;


    // use to different earth axis length    
    var a = 6378137.0;        // Earth Major Axis (WGS84)    
    var b = 6356752.3142;     // Minor Axis    
    var f = (a - b) / a;        // "Flattening"    
    var e = 2.0 * f - f * f;      // "Eccentricity"      

    var beta = (a / Math.sqrt(1.0 - e * Math.sin(lat1) * Math.sin(lat1)));
    var cos = Math.cos(lat1);
    var x = beta * cos * Math.cos(long1);
    var y = beta * cos * Math.sin(long1);
    var z = beta * (1 - e) * Math.sin(lat1);

    beta = (a / Math.sqrt(1.0 - e * Math.sin(lat2) * Math.sin(lat2)));
    cos = Math.cos(lat2);
    x -= (beta * cos * Math.cos(long2));
    y -= (beta * cos * Math.sin(long2));
    z -= (beta * (1 - e) * Math.sin(lat2));

    return (Math.sqrt((x * x) + (y * y) + (z * z)) / 1000);
  }
  
  render() {
    let requests = this.props.requests
    
    if (this.props.requests)
      return (
        <div>
          <ButtonGroup>
          <Button color="primary" onClick={()=>this.props.onClickList()} active={false}  >List</Button>
          <Button color="secondary" onClick={()=>this.props.onClickMap()}   active={true} >Map</Button>
          
        </ButtonGroup>
        <CustomSkinMap user={this.state.user}  requests={requests} longitude={this.props.longitude} latitude={this.props.latitude}
         setStateForShowDetails={(request,id)=>this.props.setStateForShowDetails(request,id)}
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC0v_0U9D2XAiaTWefqUkT3fqaTA8i5C4U"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `100vh` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
       {/*  <InfoWindow onCloseClick={this.props.handleCloseCall}>
                 <span>Something</span>
             </InfoWindow> */}
        </div>
      )
  }

}

const CustomSkinMap = withScriptjs(
  withGoogleMap(props => (

    <GoogleMap
      defaultZoom={13}
      defaultCenter={{ lat: parseFloat(props.latitude), lng: parseFloat(props.longitude) }}
      defaultOptions={{
        scrollwheel: false,
        zoomControl: true,
        styles: [
          {
            featureType: "water",
            stylers: [
              { saturation: 43 },
              { lightness: -11 },
              { hue: "#0088ff" }
            ]
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [
              { hue: "#ff0000" },
              { saturation: -100 },
              { lightness: 99 }
            ]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#808080" }, { lightness: 54 }]
          },
          {
            featureType: "landscape.man_made",
            elementType: "geometry.fill",
            stylers: [{ color: "#ece2d9" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [{ color: "#ccdca1" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#767676" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }]
          },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          {
            featureType: "landscape.natural",
            elementType: "geometry.fill",
            stylers: [{ visibility: "on" }, { color: "#b8cb93" }]
          },
          { featureType: "poi.park", stylers: [{ visibility: "on" }] },
          {
            featureType: "poi.sports_complex",
            stylers: [{ visibility: "on" }]
          },
          { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
          {
            featureType: "poi.business",
            stylers: [{ visibility: "simplified" }]
          }
        ]
      }}
    >
     
      {props.requests.map((mark, index) => <Marker key/* ={item.id}
              title={item.name}
              name={item.name} */ key={index} onClick={()=>{props.setStateForShowDetails(mark,props.user)}} position={{ lat: parseFloat(mark.latitude), lng: parseFloat(mark.longitude) }} />)}
       
    </GoogleMap>
  ))
);

let places = [
  {
    "id": 1,
    "name": "Park Slope",
    "latitude": "40.6710729",
    "longitude": "-73.9988001"
  },
  {
    "id": 2,
    "name": "Bushwick",
    "latitude": "40.6942861",
    "longitude": "-73.9389312"
  },
  {
    "id": 3,
    "name": "East New York",
    "latitude": "40.6577799",
    "longitude": "-73.9147716"
  }
]