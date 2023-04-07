
import {IoIosArrowDown} from 'react-icons/io'
import "./navbar.css"
import React, { useState } from 'react'

const navbar = ({current}) => {
    const [open,setOpen]=useState(false)
  return (
   
<div class="navbar">
<div class="logo">
    <p>Chaabane Cleaning int</p>
</div>
<div class="choices">
    <p style={current==="Home" ? ({color:"#cafb42"}):{}}>Home</p>
    <div className="services-whole" onMouseOver={e=>setOpen(true)} onMouseLeave={e=>setOpen(false)}>

    <div class="styled_choice">
        <div></div>
          <p style={current==="Services" ? ({color:"#cafb42"}):{}}>Services</p>
<IoIosArrowDown  onClick={e=>setOpen(open=>!open)}style={open ? {cursor:"pointer",transform:"rotate(180deg)",transition:"all .1s ease"} : {cursor:"pointer",transition:"all .1 ease"}}/>
{open && <>
<div className="services_dropdown">
            <p>Entretien marbre</p>
            <p>nettoyage parterre</p>
            <p>nettoyage moquette</p>
            <p>nettoyage sallon</p>
            <p>nettoyage voiture</p>
            <p>nettoyage vitres
            </p>
            </div>
        <div className="triangle"></div></>}
</div>
</div>
    <div class="styled_choice">
       <div></div>
        <p style={current==="Projects" ? ({color:"#cafb42"}):{}}>Projects</p>

</div>

        <div class="styled_choice">
           <div></div>
            <p>Contact Us</p>

        </div>
</div>
</div>
  )  
}

export default navbar
