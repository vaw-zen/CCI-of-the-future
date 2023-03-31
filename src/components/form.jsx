import React from 'react'
import './form.css'
import {BsArrowBarRight} from "react-icons/bs"
const form = () => {
  return (
    <div className="form_container">
        <h1>Contactez-nous : </h1>
        <input placeholder='Sujet : ' />
        
        <input placeholder='Votre nom' />
        <input placeholder='Numero de telephone '  />
        
        <input placeholder='Votre email ' type={'email'} />
        
        <input placeholder='Sneak peak ' />
        <button>Send it <BsArrowBarRight/> </button>
    </div>

  )
}

export default form
