import React, { Component } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import avatar from "assets/img/faces/marc.jpg";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UploadButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import TextField from '@material-ui/core/TextField';
import { Link, Redirect } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import './styles.css';
const styles = {
    cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    }
};

const useStyles = makeStyles((styles) => ({
    root: {
        width: 500,
        '& > * + *': {
            marginTop: styles.spacing(3),
        },
    }, input: {
        display: 'none',
    },
}));
class Requests extends Component {
    constructor(props) {
        super(props);

        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangePriority = this.onChangePriority.bind(this);
        this.onChangeCategory = this.onChangeCategory.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.getCoordinates = this.getCoordinates.bind(this);
        this.state = {
            requests: [],
            description: '',
            title: '',
            longitude: 0,
            latitude: 0,
            priority: 0,
            tags: [],
            files: [],
            category: 'General',
            upload:false,
            tagsHistory:[]
           
        }

    }
    handleKeyDown(event) {

        switch (event.key) {
            case ",":
            case " ": {
                event.preventDefault();
                event.stopPropagation();
                if (event.target.value.length > 0) {
                    this.setState({ tags: event.target.tags });

                }
                break;
            }
            default:
        }
    }
    /*  handleChange(event) {
         console.log(event.target.value);
           let tagss = [].concat(this.state.tags, event.target.value)
         this.setState({ value: event.target.value });
         console.log(this.state.tags)
     }
     handleSubmit(event) {
         alert('A name was submitted: ' + this.state.tags);
         event.preventDefault();
     } */
    /*  removeTag = (i) => {
         const newTags = [...this.state.tags];
         newTags.splice(i, 1);
         this.setState({ tags: newTags });
     }
  */

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

    componentDidMount() {
        this.getLocation();
        this.readData();
    }
    readData() {
        const token = getCookie('token');
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
              this.setState({tagsHistory:res.data})

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
    onChangeCategory(e) {
        this.setState({
            category: e.target.value
        })
    }
    onChangePriority(e) {
        this.setState({
            priority: e.target.value
        })
    }
    onChangeDescription(e) {
        this.setState({
            description: e.target.value
        })
    }

    onSubmit() {
        
        const token = getCookie('token');

        axios
            .post(
                `${process.env.REACT_APP_API_URL}/request/add`,
                {
                    title: this.state.title,
                    description: this.state.description,
                    longitude: this.state.longitude,
                    latitude: this.state.latitude,
                    tags: this.state.tags,
                    priority: this.state.priority,
                    category:this.state.category,
                    images:this.state.files
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
                this.setState({title:'',description:'',tags:[],priority:0,category:'General',files:[]})
            })
            .catch(err => {
                console.log(err.response);
                toast.error('Please Fill all the fields');
            });
    }
    handleUploadFile = (event) => {
        
        const data = new FormData()
        const token = getCookie('token');
        data.append('file', event.target.files[0])
        data.append('name', 'some value user types')
        data.append('description', 'some value user types')
        axios
        .post(
            `${process.env.REACT_APP_API_URL}/files`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then(response => {
             console.log(response.data)
             this.setState({
                files: this.state.files.concat(response.data.fileUrl)
              })
             
             this.setState({
               imageUrl: response.data.fileUrl
             })
             this.setState({upload:true})
        })
        .catch(err => {
            console.log(err.response);
            
        });
        
      }
    fileSelectedHandler = (e) => {

        this.setState({ files: [...this.state.files, ...e.target.files] })
       
        //console.log(this.state.files);
    }
    remove(img){
        let array = [...this.state.files]; // make a separate copy of the array
        let index = array.indexOf(img)
        if (index !== -1) {
          array.splice(index, 1);
          this.setState({files: array});
        }
    }
    
    showImages(){
        console.log(this.state.files.length)
        return this.state.files.map(img => {
        return (  <div>
            <img width='320' src={img} />
            <Button onClick={()=>this.remove(img)}>cancel</Button>
          </div>)})
    }
    render() {
        const classes = this.props.classes;
        const { tags } = this.state;
        const {upload}=this.state
        
        return (
            <div>
                <ToastContainer />
                <GridContainer>

                    <GridItem xs={12} sm={12} md={8}>
                        <Card>
                            <CardHeader color="primary">
                                <h4 className={classes.cardTitleWhite}>Add Help Request</h4>

                            </CardHeader>
                            <CardBody>
                                <GridContainer>

                                    <GridItem xs={12} sm={12} md={3}>
                                        <TextField
                                            label="Title: "
                                            value={this.state.title}
                                            onChange={this.onChangeTitle}
                                            margin="normal"
                                            fullWidth
                                        />
                                        {/* <input
                                            type="text"
                                            className="form-control"
                                            value={this.state.title}
                                            onChange={this.onChangeTitle}

                                        />*/}
                                    </GridItem>



                                </GridContainer>
                                <br></br>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={2}>
                                        <FormControl style={{ marginLeft: "auto" }} required className={classes.formControl}>
                                            <InputLabel id="demo-simple-select-required-label">Priority</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-required-label"
                                                id="demo-simple-select-required"
                                                value={this.state.priority}
                                                onChange={this.onChangePriority}
                                                className={classes.selectEmpty}
                                            >
                                                <MenuItem value={0}>Normal</MenuItem>
                                                <MenuItem value={1}>Urgent</MenuItem>

                                            </Select>

                                        </FormControl>
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={3}>
                                        <FormControl style={{ marginLeft: "auto" }} required className={classes.formControl}>
                                            <InputLabel id="demo-simple-select-required-label">Category</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-required-label"
                                                id="demo-simple-select-required"
                                                value={this.state.category}
                                                onChange={this.onChangeCategory}
                                                className={classes.selectEmpty}
                                            >
                                                <MenuItem value='General'>General</MenuItem>
                                                <MenuItem value='Electricity'>Electricity</MenuItem>
                                                <MenuItem value='Food'>Food</MenuItem>

                                            </Select>

                                        </FormControl>
                                    </GridItem>
                                </GridContainer>
                                <br></br>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <InputLabel style={{ color: "#AAAAAA" }}>Description</InputLabel>

                                        <TextField
                                            variant="outlined"
                                            label="Describe in details what you need"
                                            multiline={true}
                                            value={this.state.description}
                                            onChange={this.onChangeDescription}
                                            margin="normal"
                                            fullWidth
                                        />

                                        {/*  <CustomInput
                                            labelText="Describe in details what you need"
                                            id="description"

                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                multiline: true,
                                                rows: 5,

                                            }}
                                        /> */}
                                    </GridItem>
                                </GridContainer>
                                <GridContainer>

                                    <GridItem xs={12} sm={12} md={12}>
                                        {/* 
                                        <div className="input-tag">
                                            <ul className="input-tag__tags">
          { tags.map((tag, i) => (
            <li key={tag}>
              {tag}
              <button type="button" onClick={() => { this.removeTag(i); }}>+</button>
            </li>
          ))}
          <li className="input-tag__tags__input"><input type="text" onKeyDown={this.inputKeyDown} ref={c => { this.tagInput = c; }} /></li>
        </ul>
                                        </div> */}
                                        <div /* className={classes.root} */>
                                            <div /* style={{ width: 750 }} */>
                                                <Autocomplete
                                                    multiple
                                                    freeSolo
                                                    id="tags-outlined"
                                                    options={this.state.tagsHistory}
                                                    getOptionLabel={option => option.title || option}
                                                    value={this.state.tags}
                                                    onChange={(event, newValue) =>{ console.log(newValue) ; this.setState({ tags: newValue })}}
                                                    filterSelectedOptions
                                                    renderInput={params => {
                                                        params.inputProps.onKeyDown = this.handleKeyDown;
                                                        return (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                label="Tags"
                                                                placeholder="Put significal Tags for your help request"
                                                                margin="normal"
                                                                fullWidth
                                                            />
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>

                                    </GridItem>
                                </GridContainer>
                            </CardBody>
                            <CardFooter>
                                <input onChange={this.handleUploadFile}  multiple accept="image/*" className={classes.input} id="icon-button-file" type="file" />
                                <label htmlFor="icon-button-file">
                                    <IconButton color="primary" aria-label="upload picture" component="span">
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                                
                                {upload && this.showImages()}
                                <Button onClick={()=>this.onSubmit()} variant="contained" color="primary">
                                Add Request
                                </Button>
                            </CardFooter>
                        </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <Card profile>
                            <CardAvatar profile>
                                <a href="#pablo" onClick={e => e.preventDefault()}>
                                    <img src={avatar} alt="..." />
                                </a>
                            </CardAvatar>
                            <CardBody profile>
                                <h6 className={classes.cardCategory}>CEO / CO-FOUNDER</h6>
                                <h4 className={classes.cardTitle}>Alec Thompson</h4>
                                <p className={classes.description}>
                                    Don{"'"}t be scared of the truth because we need to restart the
                  human foundation in truth And I love you like Kanye loves Kanye
                  I love Rick Owens’ bed design but the back is...
                </p>
                                <Button color="primary" round>
                                    Follow
                </Button>
                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>
            </div >
        )
    }

}


export default function Dashboard() {
    const classes = useStyles();
    return <Requests classes={classes}></Requests>
}

