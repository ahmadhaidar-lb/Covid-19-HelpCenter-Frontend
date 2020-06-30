/*eslint-disable*/
import React, { Component } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";

import classnames from "classnames";
import Autocomplete from '@material-ui/lab/Autocomplete';
import imagine1 from "assets/img/sidebar-1.jpg";
import imagine2 from "assets/img/sidebar-2.jpg";
import imagine3 from "assets/img/sidebar-4.jpg";
import imagine4 from "assets/img/untitled.png";
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from "components/CustomButtons/Button.js";
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
export default function FixedPlugin(props) {

    const [classes, setClasses] = React.useState("dropdown show");
    const [bg_checked, setBg_checked] = React.useState(true);
    const [bgImage, setBgImage] = React.useState(props.bgImage);
    const [tag, setTag] = React.useState();
    const [category, setCategory] = React.useState();
    const [categoryName, setCategoryName] = React.useState('All');
    const [tags, setTags] = React.useState();
    const handleClick = () => {
        props.handleFixedClick();
    };
    function handleKeyDown(event) {

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
    return (
        <div
            className={classnames("fixed-plugin", {
                "rtl-fixed-plugin": props.rtlActive
            })}

        >
            <div id="fixedPluginClasses" className={props.fixedClasses}>
                <div onClick={handleClick}>
                    <i className="fa fa-cog fa-2x" />
                </div>
                <ul className="dropdown-menu"    style={{/* backgroundImage: "url(" + imagine3 + ")" */ height: 400 }}>
                    <li className="header-title">REQUESTS FILTER</li>
                    <li className="adjustments-line">
                        <a >
                            <div>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Filter Over</FormLabel>
                                    <RadioGroup aria-label="gender" name="gender1" >
                                        <FormControlLabel value="distance" control={<Radio />} label="Distance"
                                            onChange={(e) => { props.handleSearch("distance"); setCategory(false); setTag(false); }} />
                                        <FormControlLabel value="priority" control={<Radio />} label="Priority"
                                        onChange={(e) => { props.handleSearch("priority"); setCategory(false); setTag(false); }} />
                                        <FormControlLabel value="category" control={<Radio />} label="Category" 
                                          onChange={(e) => { setCategory(true); setTag(false) }}
                                        />
                                         <FormControlLabel value="tag" control={<Radio />} label="Tags" 
                                          onChange={(e) => { setCategory(false); setTag(true) }} 
                                        />
                                        {/*  <FormControlLabel value="disabled" disabled control={<Radio />} label="(Disabled option)" /> */}
                                    </RadioGroup>
                                </FormControl>
                              {/*   <span style={{ color: 'black' }}>
                                    <input type="radio" name="address"
                                        value='distance'
                                        
                                        onChange={(e) => { props.handleSearch("distance"); setCategory(false); setTag(false); }} />
                                 Distance
                                </span > */}
                               {/*  <span style={{ color: 'black' }}>
                                    <input type="radio" name="address"
                                        value='priority'
                                       
                                        onChange={(e) => { props.handleSearch("priority"); setCategory(false); setTag(false); }} />
                Priority
                </span > */}
                              {/*   <span style={{ color: 'black' }}>
                                    <input type="radio" name="address"
                                        value='category'
                                       
                                        onChange={(e) => { setCategory(true); setTag(false) }} />
                category
                </span> */}
                              {/*   <span style={{ color: 'black' }}>
                                    <input type="radio" name="address"
                                        value='tag'
                                       
                                        onChange={(e) => { setCategory(false); setTag(true) }} />
                tags
                </span>
 */}
                            </div>

                            {tag ? (<div className={classes.root}>
                                <div style={{ width: 270 }}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        id="tags-outlined"
                                        options={props.allTags}
                                        getOptionLabel={option => option.title || option}
                                        value={tags}
                                        onChange={(event, newValue) => { props.handleTags(newValue) }}
                                        filterSelectedOptions
                                        renderInput={params => {
                                            /* params.inputProps.onKeyDown = handleKeyDown(); */
                                            return (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    label="Tags"
                                                    placeholder="Put significal Tags"
                                                    margin="normal"
                                                    fullWidth
                                                />
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                            ) : (<div></div>
                                )}
                            {category ? (<div className={classes.root}>
                                <div style={{ width: 270 }}>
                                    <Select
                                        labelId="demo-simple-select-required-label"
                                        id="demo-simple-select-required"
                                        value={categoryName}
                                        onChange={(event, newValue) => { console.log(newValue.props.value); setCategoryName(newValue.props.value); props.handleCategoryFilter(newValue.props.value); }}
                                        className={classes.selectEmpty}
                                    >
                                        <MenuItem value='All'>All</MenuItem>
                                        <MenuItem value='General'>General</MenuItem>
                                        <MenuItem value='Electricity'>Electricity</MenuItem>
                                        <MenuItem value='Food'>Food</MenuItem>

                                    </Select>

                                </div>
                            </div>
                            ) : (<div></div>
                                )}
                        </a>
                    </li>
                    <li className="adjustments-line" />
                </ul>
            </div>
        </div>
    );
}

FixedPlugin.propTypes = {
    bgImage: PropTypes.string,
    handleFixedClick: PropTypes.func,
    rtlActive: PropTypes.bool,
    fixedClasses: PropTypes.string,
    bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
    handleColorClick: PropTypes.func,
    handleImageClick: PropTypes.func
};
const top100Films = [
    "The Shawshank Redemption",
    "The Godfather",
    "The Godfather: Part II"
];