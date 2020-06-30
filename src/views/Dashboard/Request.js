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
import { Link, Redirect } from 'react-router-dom';
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


class Requests extends Component {
  constructor(props) {
    super(props);

    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
    this.state = {
      requests: [],
      description: '',
      title: '',
      longitude: 0,
      latitude: 0,

    }
  }
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.getCoordinates);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  getCoordinates(position) {

    this.setState({ longitude: position.coords.longitude, latitude: position.coords.latitude });


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
  componentDidMount() {
    this.getLocation();

    this.readData();

  }
  readData() {
    const token = getCookie('token');
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/request/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {
        let arr = [];
        for (let i = 0; i < res.data.length; i++) {
          if (this.calculateDistance(this.state.latitude, this.state.longitude, res.data[i].latitude, res.data[i].longitude) < 10)
            arr.push(res.data[i]);
        }
        this.setState({ requests: arr });

      })
      .catch(err => {
        console.log(err.response);
      });
  }
  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();
    const token = getCookie('token');

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/request/add`,
        {
          title: this.state.title,
          description: this.state.description,
          longitude: this.state.longitude,
          latitude: this.state.latitude
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {
        /*  let newRequests = this.state.requests.concat(res.data);
         this.setState({ requests: newRequests }) */
        this.readData();
        console.log(this.state.requests);
        toast.success('Help Request Added Successfully');
      })
      .catch(err => {
        console.log(err.response);
      });
  }

  render() {

    return (
      <div>
        {/*  <h3>Request Help</h3>
        <ToastContainer />
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Title: </label>
            <input
              type="text"
              className="form-control"
              value={this.state.title}
              onChange={this.onChangeTitle}
            />

          </div>
          <div className="form-group">
            <label>Description: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
            />
          </div>
          <div className="form-group">
            <input type="submit" value="Request Help" className="btn btn-primary" />
          </div>
        </form> */}
        <GridContainer>
          {this.requestsList()}
        </GridContainer>
      </div>
    )
  }
  requestsList() {
    return this.state.requests.map(currentRequest => {
      return <Request key={currentRequest._id} classes={this.props.class} request={currentRequest}></Request>;
    })
  }
}
class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: [],
      showDetails: false
    };
  }
  getUser() {
    const token = getCookie('token');
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/user/` + this.props.request.userId,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {

        this.setState({ user: res.data });

      })
      .catch(err => {
        console.log(err.response);
      });
  }
  componentDidMount() {
    this.getUser();
  }
  showRequest() {
    return (
      <div>{this.props.request.description}</div>
    );
  }
  renderRequests(props) {
    const classes = this.props.classes;
    return (


      <GridItem xs={12} sm={12} md={4}>
        <Card chart>
          <CardHeader color="warning">
            <ChartistGraph
              className="ct-chart"
              data={emailsSubscriptionChart.data}
              type="Bar"
              options={emailsSubscriptionChart.options}
              responsiveOptions={emailsSubscriptionChart.responsiveOptions}
              listener={emailsSubscriptionChart.animation}
            />
          </CardHeader>
          <CardBody>
            <div style={{ display: "flex" }}> <h4 className={classes.cardTitle}>{props.title} </h4>
              {/*  <Link
           to={`/home/Messages/${this.props.request.userId}`}
           style={{ marginLeft: "auto" }}
         >
           <i className='fas fa-sign-in-alt  w-6  -ml-2' />
           <span className='ml-3'>Offer Help</span>
         </Link> */}
             {/*  <Link
               to={`/home/Requests/${this.props.request._id}`}
                style={{ marginLeft: "auto" }}
              >
                <i className='fas fa-sign-in-alt  w-6  -ml-2' />
                <span onClick={() => this.setState({ showDetails: true })} className='ml-3'>Offer Help</span>
              </Link> */}
            </div>

            <p className={classes.cardCategory}>By {this.state.user.name}</p>

          </CardBody>
          <CardFooter chart>
            <div className={classes.stats}>
              <AccessTime /> {props.createdAt.substring(0, 10)}
            </div>
            <div className={classes.stats}>
              {props.createdAt.substring(11, 19)}
            </div>
          </CardFooter>
        </Card>
      </GridItem>

    );
  }
  render() {
    if (this.state.showDetails)
      return this.showRequest();
    else
      return this.renderRequests(this.props.request);

  }

}
export default function Dashboard() {
  const classes = useStyles();
  return <Requests class={classes}></Requests>
}