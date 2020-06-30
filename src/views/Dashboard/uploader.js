import React, { Component } from 'react';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
class Uploader extends Component {

  state = {
    imageUrl: 'https://placeimg.com/320/320/animals' 
  }
  
  handleUploadFile = (event) => {
    const data = new FormData()
    const token = getCookie('token');
    data.append('file', event.target.files[0])
    data.append('name', 'some value user types')
    data.append('description', 'some value user types')
    /* axios.post(`${process.env.REACT_APP_API_URL}/files`, data, {
      headers: {
          Authorization: `Bearer ${token}`
      }
  }).then((response) => {
      console.log(response.data)
      this.setState({
        imageUrl: response.data.fileUrl
      })
    }) */

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
           imageUrl: response.data.fileUrl
         })
    })
    .catch(err => {
        console.log(err.response);
        
    });
  }
    
  render() {
    return(
      <div>
        <img width='320' src={this.state.imageUrl} />
        <div>
          <input type="file" onChange={this.handleUploadFile} />
        </div>  
      </div>
    )
  }
}

export default Uploader