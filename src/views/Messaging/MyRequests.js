import React, { Component } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Gallery from 'react-grid-gallery';
// @material-ui/icons
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
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
import FilterSideBar from "views/Dashboard/FilterSideBar.js";
import Chat from "./VideoCall.js";
import {
    dailySalesChart,
    emailsSubscriptionChart,
    completedTasksChart
} from "variables/charts.js";
import { Badge } from 'reactstrap';
import foodImg from "assets/img/food.jpg";
import authSvg from '../../assests/update.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

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
            showHelpOffers: false,
            users: [],
            chat: false,
            helpUser: '',
            showFinish: false,
            finishedBy: '',
            doneRequests: []
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
        console.log(window.location.pathname.substring(17, 41));

        axios
            .get(
                `${process.env.REACT_APP_API_URL}/request/getMyRequests`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(res => {
                let arr = [];
                let doneArr = [];
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].doneBy.length < 5) {
                        arr.push(res.data[i]);
                    }
                    else doneArr.push(res.data[i])
                }
                this.setState({ requests: arr, requestsTemp: res.data, doneRequests: doneArr });

            })
            .catch(err => {
                console.log(err.response);
            });
        axios
            .get(
                `${process.env.REACT_APP_API_URL}/users/getUsers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(res => {
                console.log(res.data)
                this.setState({ users: res.data });
                if (window.location.pathname.length > 20) {

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
    notificationToChat() {
        let requestId = window.location.pathname.substring(17);
        console.log(requestId)
        this.state.requests.map(currentRequest => {

            if (currentRequest._id == requestId) {

                this.setState({ request: currentRequest });
                console.log(currentRequest, 'set')
            }

        })
        this.setState({ user: user, showDetails: true });


    }
    showHelpedBy(request) {
        console.log(request.doneBy)

        return (<div>
            <h4>Helped By:</h4>
            <br></br>
            {this.state.users.map(user => {

                if (user._id == request.doneBy) {
                    return <div>{user.name}</div>
                }
            })}
        </div>);
    }
    showRequest(request) {
        const classes = this.props.class;
        let user = JSON.parse(localStorage.getItem('user'));
        console.log(request);
        const showHelpOffers = this.state.showHelpOffers;
        const showFinish = this.state.showFinish;
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
        if (request.doneBy.length > 5) {
            return (<Container maxWidth={12} ><GridItem xs={12} sm={12} md={10} >
                <button onClick={() => this.setState({ showDetails: false, showHelpOffers: false })} class="material-icons md-18">undo</button>
                <Card chart>

                    <CardHeader>
                        <div style={{ display: "flex" }}> <h2 className={classes.cardTitle}> {request.title} </h2>
                            <span style={{ marginLeft: "auto" }}>
                                <Badge color="primary" pill>{request.category}</Badge>
                                {request.priority === 0 ? (<Badge color="secondary" pill>{priority}</Badge>
                                ) : (<Badge color="danger">{priority}</Badge>
                                    )}
                            </span>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <br></br>
                        {this.showHelpedBy(request)}
                        <br></br>
                        <div style={{   display: 'inline-block', margin: '10px 0'  }}>
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
                            </div>
                    </CardBody>
                    <CardFooter chart>
                        <div className={classes.stats}>
                            <AccessTime /> {request.createdAt.substring(0, 10)}
                        </div>
                        <div className={classes.stats}>
                            <p>By ME</p>
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
                                <p> Distance 0 KM</p>
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
            if (!this.state.chat) {
                return (<Container maxWidth={12} ><GridItem xs={12} sm={12} md={10} >
                    <button onClick={() => this.setState({ showDetails: false, showHelpOffers: false })} class="material-icons md-18">undo</button>
                    <Card chart>

                        <CardHeader>
                            <div style={{ display: "flex" }}> <h2 className={classes.cardTitle}> {request.title} </h2>
                                <span style={{ marginLeft: "auto" }}>

                                    <Button onClick={() => this.toggleButton()} variant="outlined" color="primary">Help Offers</Button>
                                </span>
                            </div>
                            <Badge color="primary" pill>{request.category}</Badge>
                            {request.priority === 0 ? (<Badge color="secondary" pill>{priority}</Badge>
                            ) : (<Badge color="danger">{priority}</Badge>
                                )}
                        </CardHeader>
                        <CardBody>
                           
                            <div>
                            <Button onClick={() => this.toggleFinishButton()} variant="outlined" color="primary">Finish</Button>
                            <Button variant="outlined" color="secondary">Delete</Button></div>
                            <br></br>
                            {showFinish && this.showFinishBy(request)}
                           
                            {showHelpOffers && this.showHelp(request)}
                            <br></br>
                            <div style={{   display: 'inline-block', margin: '10px 0'  }}>
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
                            </div>
                        </CardBody>
                        <CardFooter chart>
                            <div className={classes.stats}>
                                <AccessTime /> {request.createdAt.substring(0, 10)}
                            </div>
                            <div className={classes.stats}>
                                <p>By ME</p>
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
                                    <p> Distance 0 KM</p>
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
                return (<Chat back={() => this.setState({ chat: false })} user={this.state.helpUser} request={request} ></Chat>);
            }
        }
    }
    toggleButton() {
        if (!this.state.showHelpOffers)
            this.setState({ showHelpOffers: true })
        else this.setState({ showHelpOffers: false })

    }
    toggleFinishButton() {
        if (!this.state.showFinish)
            this.setState({ showFinish: true })
        else this.setState({ showFinish: false })

    }
    showHelp(request) {


        return (<div>
            <h4>Users that offered help:</h4>
            <br></br>
            {this.state.users.map(user => {
                if (request.users.includes(user._id)) {
                    return <Link

                        style={{ marginLeft: "auto" }}
                    >
                        <i className='fas fa-sign-in-alt  w-6  -ml-2' />

                        <span onClick={() => this.setState({ helpUser: user, chat: true })} className='ml-3'>{user.name}</span>

                    </Link>
                }
            })}
        </div>);
    }
    isDone(request) {

        console.log(request)
        const token = getCookie('token');
        let requestId = request._id;
        let doneBy = this.state.finishedBy._id;
        axios
            .post(
                `${process.env.REACT_APP_API_URL}/request/done`,
                {
                    id: requestId,
                    doneBy: doneBy
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(res => {
                console.log(res.data)
                axios
                    .get(
                        `${process.env.REACT_APP_API_URL}/request/getMyRequests`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                    .then(res => {
                        let arr = [];
                        let doneArr = [];
                        console.log(res.data)
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].doneBy.length < 5) {
                                arr.push(res.data[i]);
                            }
                            else doneArr.push(res.data[i])
                        }
                        this.setState({ requests: arr, requestsTemp: res.data, doneRequests: doneArr, showDetails: false });

                    })
                    .catch(err => {
                        console.log(err.response);
                    });
            })
            .catch(err => {
                console.log(err.response);
            });

        toast.success('Nice! you have been helped');



    }
    showFinishBy(request) {
        console.log(request)
        let arr = []
        this.state.users.map(user => {
            if (request.users.includes(user._id)) {
                arr.push(user);
            }
        });
        return (<div style={{ width: 180 }}>
            <Autocomplete
                single
                freeSolo
                id="tags-outlined"
                options={arr}
                getOptionLabel={option => option.name}
                value={this.state.finishedBy}
                onChange={(event, newValue) => { console.log(newValue); this.setState({ finishedBy: newValue }) }}
                filterSelectedOptions
                renderInput={params => {
                    params.inputProps.onKeyDown = this.handleKeyDown;
                    return (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Finished By"

                            margin="normal"
                            fullWidth
                        />
                    );
                }}

            />
            <Button onClick={() => this.isDone(request)} variant="contained" color="primary">
                CONFIRM
            </Button>

        </div>);
    }
    setStateForShowDetails(bla, bla2) {
        this.setState({ showDetails: true, request: bla, user: bla2 });
    }
    render() {

        return (
            <div>
                <ToastContainer />
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
                    {this.requestsDoneList()}
                </GridContainer>
                <FilterSideBar
                    kousa={(filterKey) => this.filter(filterKey)}
                    search={(tags) => this.search(tags)}
                />

            </div>
        )
    }
    search(tags) {
        let arr = [];
        let arr2 = [];
        console.log(this.state.requestsTemp)
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
        });
        console.log(arr)
        this.setState({ requests: arr });
    }
    filter(filterKey) {
        if (filterKey === 'distance') {
            let arr = [];
            for (let i = 0; i < this.state.requests.length; i++) {
                arr.push = this.calculateDistance(this.state.latitude, this.state.longitude, this.state.requests[i].latitude, this.state.requests[i].longitude);
                this.state.requests[i].distance = this.calculateDistance(this.state.latitude, this.state.longitude, this.state.requests[i].latitude, this.state.requests[i].longitude);
            }

            const myFilteredRequests = [].concat(this.state.requests)
                .sort((a, b) => a.distance > b.distance ? 1 : -1);
            this.setState({ requests: myFilteredRequests })
            /* console.log(this.state.requests[3].tags[0]); */
        }
    }
    requestsDoneList() {
        if (!this.state.showDetails) {
            return this.state.doneRequests.map(currentRequest => {

                return <Request key={currentRequest._id} set={(requestt) => this.setState({ request: requestt })} classes={this.props.class} setStateForShowDetails={(bla2) => this.setStateForShowDetails(currentRequest, bla2)} request={currentRequest}></Request>;
            })
        }
        else {
            if (this.state.request.doneBy.length > 5)
                return this.showRequest(this.state.request, this.state.user);
        }
    }
    requestsList() {
        if (!this.state.showDetails) {
            return this.state.requests.map(currentRequest => {

                return <Request key={currentRequest._id} set={(requestt) => this.setState({ request: requestt })} classes={this.props.class} setStateForShowDetails={(bla2) => this.setStateForShowDetails(currentRequest, bla2)} request={currentRequest}></Request>;
            })
        }
        else {
            if (this.state.request.doneBy.length < 5)
                return this.showRequest(this.state.request, this.state.user);
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
        else
            if (props.category === 'Food')
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
                                <span onClick={() => this.props.setStateForShowDetails(this.state.user)} className='ml-3'>Details</span>
                            </Link>
                        </div>
                        <div style={{ display: "flex" }}>
                            <p className={classes.cardCategory}>By ME</p>
                            {props.doneBy.length > 5 ? (<p style={{ marginLeft: "auto" }} className={classes.cardCategory}>Done</p>
                            ) : (<p style={{ marginLeft: "auto" }} className={classes.cardCategory}>Waiting</p>
                                )}

                        </div>
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

    render() {

        return this.renderRequests(this.props.request);

    }

}
export default function Dashboard() {
    const classes = useStyles();
    return <Requests class={classes}></Requests>
}