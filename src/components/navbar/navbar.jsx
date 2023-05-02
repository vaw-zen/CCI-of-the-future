
import { IoIosArrowDown } from 'react-icons/io/index.js'
import "./navbar.css"
import Contact from "../Contact.astro"
import React, { useState, useEffect } from 'react'

const navbar = () => {
  const [open, setOpen] = useState(false)
  const [menuActive, setMenuActive] = useState(false);
  const [current, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname.slice(0,9));
  }, []);

  const handleMenuClick = () => {
    setMenuActive(!menuActive);
  };



  return (
    <div className="navbar">
      <div className="logo">
        <p>Chaabane Cleaning int</p>
      </div>
      <div className="choices">
        <a href='/' style={current === "/" || "" ? ({ color: "#cafb42", cursor: 'pointer' }) : { cursor: 'pointer' }}>
          Home
        </a>
        <div className="services-whole" style={{zIndex:"80000"}} onMouseOver={e => setOpen(true)} onMouseLeave={e => setOpen(false)}>
          <div className="styled_choice">
            <div></div>
            <p style={current === "/services" ? ({ color: "#cafb42" }) : {}}>Services</p>
            <IoIosArrowDown onClick={e => setOpen(open => !open)} style={open ? { cursor: "pointer", transform: "rotate(180deg)", transition: "all .1s ease" } : { cursor: "pointer", transition: "all .1 ease" }} />
            {open && <>
              <div className="services_dropdown">
              <a href="/marbre"> <p className='btoline'>Entretien marbre</p>
              </a>
              <a href="/tapis"> <p className='btoline'>Nettoyage tapisserie</p>
             </a> 
             <a href="/moquette"> <p>nettoyage moquette</p>
              </a>  <p>nettoyage sallon</p>
                <p>nettoyage voiture</p>
                <p>nettoyage vitres
                </p>
              </div>
              <div className="triangle"></div></>}
          </div>
        </div>
        <div className="styled_choice">
          <div></div>
          <a href="/projects">   <p style={current === "/projects" ? ({ color: "#cafb42" }) : {}}>Projects</p>
          </a>
        </div>

        <div className="styled_choice">
          <div></div>
          <a href="/#contact"> <p>Contact Us</p> </a>

        </div>

      </div>
      <a href="#" style={{height:"65px"}} className={menuActive ? 'menuBtn act' : 'menuBtn'} onClick={handleMenuClick}>
        <span className="lines"></span>
      </a>
      <nav  style={{width:"100vw"}} className={menuActive ? 'mainMenu act' : 'mainMenu'}>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <p className="serv" onClick={e => setOpen(open => !open)}>Services</p>
          </li>
          {open &&
            <>
             <a style={{ display:"block", fontWeight:"100",color:"#fff",fontSize:"20px"}} href="/marbre"> <p className='btoline'>Entretien marbre</p>
              </a>
              <a style={{ display:"block", fontWeight:"100",color:"#fff",fontSize:"20px"}} href="/tapis"> <p className='btoline'>Nettoyage tapisserie</p>
             </a> 
             <a style={{color:"#fff", fontWeight:"100",fontSize:"20px"}} href="/moquette"> <p>nettoyage moquette</p>
              </a>  
             
             </>}
          <li>
            <a href="/projects">Projects</a>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>

        </ul>
      </nav>
      
    </div>
  )
}

export default navbar
