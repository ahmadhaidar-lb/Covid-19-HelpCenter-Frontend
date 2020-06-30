import React,{useEffect} from "react";
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";
import FixedPlugins from "views/Dashboard/FilterSideBar.js";
import routes from "routes.js";
import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";
import bgImage from "assets/img/sidebar-2.jpg";
import logo from "assets/img/reactlogo.png";
import { getCookie} from '../helpers/auth';
import axios from 'axios';
let ps;

const switchRoutes = (
  <Switch>
    {routes.map((prop, key) => {
      if (prop.layout === "/home") {
        
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
           
          />
        );
      }
      return null;
    })}
    <Redirect from="/home" to="/home/requests" />
  </Switch>
);

const useStyles = makeStyles(styles);

export default function Admin({ ...rest }) {
  // styles
  const classes = useStyles();
  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();
 
  // states and functions
  
  const getRoute = () => {
   
    return window.location.pathname !== "/admin/maps";
  };
  const showFiltering=()=>{
    if(window.location.pathname==="/home/requests")
    return <FixedPlugins></FixedPlugins>
  }
  return (
    <div className={classes.wrapper}>
      <Sidebar
        routes={routes}
        logoText={"Covid-19 Help Center"}
        logo={logo}
        image={bgImage}
        color='blue'
        {...rest}
      />
      <div className={classes.mainPanel} ref={mainPanel}>
        <Navbar 
          routes={routes}
          {...rest}
        />
        {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present 
        //because they have some paddings which would make the map smaller */}
        {getRoute() ? ( 
          <div className={classes.content}>
            <div className={classes.container}>{switchRoutes}</div>
          </div>
        ) : (
          <div className={classes.map}>{switchRoutes}</div>
        )}
        {getRoute() ? <Footer /> : null}
     {/* {showFiltering()} */}
      </div>
    </div>
  );
}
