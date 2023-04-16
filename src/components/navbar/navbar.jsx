
import {IoIosArrowDown} from 'react-icons/io'
import "./navbar.css"
import React, { useState } from 'react'

const navbar = ({current}) => {
    const [open,setOpen]=useState(false)
    
  const [menuActive, setMenuActive] = useState(false);

  const handleMenuClick = () => {
    setMenuActive(!menuActive);
  };
  return (
   
<div className="navbar">
<div className="logo">
    <p>Chaabane Cleaning int</p>
</div>
<div className="choices">
    <p style={current==="Home" ? ({color:"#cafb42",cursor:'pointer'}):{cursor:'pointer'}}>Home</p>
    <div className="services-whole" onMouseOver={e=>setOpen(true)} onMouseLeave={e=>setOpen(false)}>

    <div className="styled_choice">
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
    <div className="styled_choice">
       <div></div>
        <p style={current==="Projects" ? ({color:"#cafb42"}):{}}>Projects</p>

</div>

        <div className="styled_choice">
           <div></div>
            <p>Contact Us</p>

        </div>

</div>
<a href="#" className={menuActive ? 'menuBtn act' : 'menuBtn'} onClick={handleMenuClick}>
				<span class="lines"></span>
			</a>
			<nav className={menuActive ? 'mainMenu act' : 'mainMenu'}>
				<ul>
					<li>
						<a href="/">Home</a>
					</li>
					<li>
						<p className="serv" onClick={e=>setOpen(open=>!open)}>Services</p>
					</li>
          {open && 
          <>
         <p className='btoline'>Entretien marbre</p>
          <p className='btoline'>nettoyage aarterre</p>
          <p className='btoline'>nettoyage moquette</p>
          <p className='btoline'>nettoyage sallon</p>
          <p className='btoline'>nettoyage voiture</p>
          <p className='btoline'>nettoyage vitres
            </p></>
          }
					<li>
						<a href="/projects">Projects</a>
					</li>
					<li>
						<a href="/contact">Contact</a>
					</li>
					
				</ul>
			</nav>
</div>
  )  
}

export default navbar
