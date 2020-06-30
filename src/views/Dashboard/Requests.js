import React, { Component, useRef } from "react";
//socket 
import io from "socket.io-client";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import Gallery from 'react-grid-gallery';
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Autocomplete from '@material-ui/lab/Autocomplete';
import Container from '@material-ui/core/Container';
import Button2 from '@material-ui/core/Button';
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
//category images
import foodImg from "assets/img/food.jpg";
import electricityImg from "assets/img/sidebar-2.jpg";
import generalImg from "assets/img/sidebar-3.jpg";
//import imagine4 from "assets/img/sidebar-4.jpg";
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
import FilterSideBar from "views/Dashboard/FilterSideBar.js";
import TextField from '@material-ui/core/TextField';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, ButtonGroup } from 'reactstrap';


import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts.js";
import { Badge } from 'reactstrap';
import authSvg from '../../assests/update.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Chat from "./Chat.js";
import Map from "./Maps.js";
const useStyles = makeStyles(styles)
let user = JSON.parse(localStorage.getItem('user'));

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
      requestsTemp: [],
      description: '',
      title: '',
      longitude: 0,
      latitude: 0,
      request: '',
      priority: 0,
      category: '',
      showDetails: false,
      request: '',
      user: [],
      chat: false,
      images: [],
      tagsHistory: [],
      showMap:false,
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
        console.log(user.helpRadius)
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].doneBy.length < 5) {
            if (this.calculateDistance(this.state.latitude, this.state.longitude, res.data[i].latitude, res.data[i].longitude) < user.helpRadius) {
              res.data[i].distance = this.calculateDistance(this.state.latitude, this.state.longitude, res.data[i].latitude, res.data[i].longitude);
              arr.push(res.data[i]);
            }
          }
        }
        this.setState({ requests: arr, requestsTemp: arr });
        console.log(arr)

      })
      .catch(err => {
        console.log(err.response);
      });
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/request/getAllTags`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {
        this.setState({ tagsHistory: res.data })
        if (window.location.pathname.length > 20) {
          console.log('getet')
          this.notificationToChat();

        }
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
  /* showRequest() {
    return (
      <div>{this.props.request.description}</div>
    );
  } */
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
  
  showRequest(request) {
    console.log(request.tags)
    const classes = this.props.class;
    let user = JSON.parse(localStorage.getItem('user'));
    let IMAGES = [];
    request.images.map(img => {
      IMAGES.push({
        src: img,
        thumbnail: img,
        thumbnailWidth: 200,
        thumbnailHeight: 200,
        caption: "",

      });
    })
    let priority = ''
    if (request.priority === 0)
      priority = 'Normal'
    else priority = 'Urgent'

    console.log(request)
    if (!this.state.chat) {
      if (request.users.includes(user._id)) {
        return (<Container maxWidth={12} ><GridItem xs={12} sm={12} md={10} >
          <button onClick={() => this.setState({ showDetails: false })} class="material-icons md-18">undo</button>
          <Card chart>

            <CardHeader>
              <div style={{ display: "flex" }}> <h2 className={classes.cardTitle}>{request.title} </h2>
                <span style={{ marginLeft: "auto" }}>

                  <Button2 onClick={() => this.setState({ chat: true })} variant="outlined" color="primary">
                    Chat
                </Button2>
                </span>
              </div>
              <div>
                <Badge color="primary" pill>{request.category}</Badge>
                {request.priority === 0 ? (<Badge color="secondary" pill>{priority}</Badge>
                ) : (<Badge color="danger">{priority}</Badge>
                  )}

              </div>
            </CardHeader>
            <CardBody>
              {request.tags.map(tag => {
                return (<span style={{ paddingRight: '4px' }}>
                  <span style={{
                    backgroundColor: '#282c34',
                    color: 'white',
                    padding: '5px',
                    fontFamily: 'Arial',
                    textAlign: 'center', paddingRight: '4px'
                  }}>{tag}  </span></span>
                )

              })}

            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> {request.createdAt.substring(0, 10)}
              </div>
              <div className={classes.stats}>
                <p>By {this.state.user.name}</p>
              </div>
            </CardFooter>
          </Card>
        </GridItem>

          <GridItem xs={12} sm={12} md={10}  >
            <Card chart style={{ backgroundColor: "grey" }}>
              <CardHeader color="secondary">
                <h2 className={classes.cardTitleWhite}>Gallery</h2>

              </CardHeader>
              <CardBody>
                <Gallery images={IMAGES} />
              </CardBody>
            </Card>

          </GridItem>
          <GridItem xs={12} sm={12} md={10} >
            <Card chart>
              <CardHeader>
                <h2 className={classes.cardTitle}>Details</h2>
              </CardHeader>
              <CardBody>
                <p>{request.description}</p>
              </CardBody>
              <CardFooter chart>
                <div className={classes.stats}>
                  <p> Distance {request.distance.toFixed(2)} KM</p>
                </div>
                <div className={classes.stats}>
                  <p>Offers #: {request.users.length}</p>
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </Container>
        );
      }
      else {
        return (<GridItem xs={12} sm={12} md={10}>
          <button onClick={() => this.setState({ showDetails: false })} class="material-icons md-18">undo</button>


          <Card chart>

            <CardBody>
              <div style={{ display: "flex" }}> <h4 className={classes.cardTitle}>{request.title} </h4>

              </div>

              <p className={classes.cardCategory}>By {this.state.user.name}</p>
              <p>{request.description}</p>
              <div style={{ display: "flex" }}>
                <Link
                  to={`/home/Messages/${request.userId}`}
                  style={{ marginLeft: "auto" }}
                >
                  <i className='fas fa-sign-in-alt  w-6  -ml-2' />

                  <span className='ml-3'>Offer Help</span>

                </Link>
              </div>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> {request.createdAt.substring(0, 10)}
              </div>
              <div className={classes.stats}>
                {request.createdAt.substring(11, 19)}
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        );
      }
    }
    else {
      console.log(this.state.user.name)
      return (<Chat back={() => this.setState({ chat: false })} userName={this.state.user.name} request={request} ></Chat>);
    }
  }
  setStateForShowDetails(bla, bla2) {
    this.getUser(bla);
    this.setState({ showDetails: true, request: bla, user: bla2 });
  }
  getUser(request) {
    const token = getCookie('token');
    console.log(request);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/user/` + request.userId,
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
  notificationToChat() {
    let requestId = window.location.pathname.substring(15, 39);
    let requestUserId = window.location.pathname.substring(40);
    console.log(this.state.tags)
    this.state.requests.map(currentRequest => {

      if (currentRequest._id == requestId) {
        this.setState({ request: currentRequest });
        console.log(currentRequest, 'set')
      }

    })
    this.getUser(this.state.request);


  }
  render() {
    if(this.state.showMap)
    {
      return <Map setStateForShowDetails={(request,id) =>{this.setState({showMap:false}) ;this.setStateForShowDetails(request,id)}}   onClickList={()=>this.setState({showMap:false})}  onClickMap={()=>this.setState({showMap:true})} longitude={this.state.longitude} latitude={this.state.latitude} requests={this.state.requests}></Map>
    }
    else
    if(!this.state.showDetails)
    return (
      <div>
     

        <ButtonGroup>
          <Button color="primary" onClick={()=>this.setState({showMap:false})} active={!this.state.showMap}  >List</Button>
          <Button color="secondary" onClick={()=>this.setState({showMap:true})}   active={this.state.showMap} >Map</Button>
          
        </ButtonGroup>
        <GridContainer>
          {this.requestsList()}
        </GridContainer>
        <FilterSideBar
          allTags={this.state.tagsHistory}
          kousa={(filterKey) => this.filter(filterKey)}
          search={(tags) => this.search(tags)}
          categoryFilter={(categoryName) => this.categoryFilter(categoryName)}
        />

      </div>
    )
    else{
      return (
        <div>
       
          <GridContainer>
            {this.requestsList()}
          </GridContainer>
          <FilterSideBar
            allTags={this.state.tagsHistory}
            kousa={(filterKey) => this.filter(filterKey)}
            search={(tags) => this.search(tags)}
            categoryFilter={(categoryName) => this.categoryFilter(categoryName)}
          />
  
        </div>
      )
    }
  }
  search(tags) {
    let arr = [];
    let arr2 = [];
    console.log(tags)
    if (tags.length > 0) {
      this.state.requestsTemp.map(currentRequest => {

        for (let i = 0; i < tags.length; i++) {
          if (currentRequest.tags.includes(tags[i])) {
            if (!arr2.includes(currentRequest._id)) {
              arr.push(currentRequest);
              arr2.push(currentRequest._id)
              //console.log(currentRequest);
            }
          }
        }

      })
    }
    else {
      this.readData();
    }
    console.log(arr)
    this.setState({ requests: arr });
  }
  categoryFilter(categoryName) {
    if (categoryName != 'All') {
      let arr = this.state.requestsTemp.filter((request) => request.category == categoryName);
      this.setState({ requests: arr })
    }
    else this.setState({ requests: this.state.requestsTemp })
  }
  filter(filterKey) {
    if (filterKey === 'distance') {

      let arr = [];
      for (let i = 0; i < this.state.requestsTemp.length; i++) {
        arr.push = this.calculateDistance(this.state.latitude, this.state.longitude, this.state.requestsTemp[i].latitude, this.state.requestsTemp[i].longitude);
        this.state.requestsTemp[i].distance = this.calculateDistance(this.state.latitude, this.state.longitude, this.state.requestsTemp[i].latitude, this.state.requestsTemp[i].longitude);
      }

      const myFilteredRequests = [].concat(this.state.requestsTemp)
        .sort((a, b) => a.distance > b.distance ? 1 : -1);
      this.setState({ requests: myFilteredRequests })
      /* console.log(this.state.requests[3].tags[0]); */
    }
    else if (filterKey === 'priority') {

      let arr = this.state.requestsTemp.filter((request) => request.priority == 1);
      let arr2 = this.state.requestsTemp.filter((request) => request.priority == 0);
      console.log(arr.concat(arr2))
      this.setState({ requests: arr.concat(arr2) })
    }

  }
  requestsList() {
    if (!this.state.showDetails) {
      return this.state.requests.map(currentRequest => {
        return <Request key={currentRequest._id} set={(requestt) => this.setState({ request: requestt })} classes={this.props.class} setStateForShowDetails={(bla2) => this.setStateForShowDetails(currentRequest, bla2)} request={currentRequest}></Request>;
      })
    }
    else {
      return this.showRequest(this.state.request);
    }
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

  renderRequests(props) {
    const classes = this.props.classes;
    let source = '';
    if (props.images[0]) {
      source = props.images[0]
    }
    else if (props.category === 'Food')
      source = foodImg;
    let priority = 'normal';
    if (props.priority === 1) {
      priority = 'urgent'
    }
    return (


      <GridItem xs={12} sm={12} md={4}>

        <Card chart>
          <CardHeader color="danger">
            <img style={{
              flex: 1,
              width: 400,
              height: 300,
              resizeMode: 'contain'
            }} src={source} />
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
              <Link

                style={{ marginLeft: "auto" }}
              >
                <i className='fas fa-sign-in-alt  w-6  -ml-2' />
                <span onClick={() => this.onOfferHelp()} className='ml-3'>Offer Help</span>
              </Link>
            </div>

            <p className={classes.cardCategory}>By {this.state.user.name}</p>
            <div style={{ display: "flex" }}>
              <div className={classes.stats}>Category: {props.category} </div>
              <div style={{ marginLeft: "auto" }} className={classes.stats}>
                Priority: {priority}
              </div></div>
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
  onOfferHelp() {
    let user = JSON.parse(localStorage.getItem('user'));
    const token = getCookie('token');
    let requestt = this.props.request;
    let userss = this.props.request.users;
    if (!userss.includes(user._id)) {
      userss = this.props.request.users.concat(user._id);
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/request/addOffer`,
          {
            id: this.props.request._id,
            users: userss
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

        })
        .catch(err => {
          console.log(err.response);
        });
      requestt.users = userss;
      this.props.set(requestt);
      toast.success('Thanks for your helping...');
      toast.success('Start Chatting now');
    }
    this.props.setStateForShowDetails(this.state.user)
  }
  render() {

    return this.renderRequests(this.props.request);

  }

}
export default function Dashboard() {
  const classes = useStyles();
  return <Requests class={classes}></Requests>
}