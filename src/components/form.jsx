import React, { useState } from 'react'
import './form.css'
import {BsArrowBarRight} from "react-icons/bs/index.js"
const form = () => {
  const [inputs,setinputs]=useState({sujet:"",nom:"",tel:"",email:"",object:""})
  return (
    <div className="form_container">
        <h1>Contactez-nous : </h1>
        <input placeholder='Sujet : ' onChange={e=>setinputs(fields=>({...fields,sujet:e.target.value}))} />
        
        <input placeholder='Votre nom' onChange={e=>setinputs(fields=>({...fields,nom:e.target.value}))}  />
        <input placeholder='Numero de telephone ' onChange={e=>setinputs(fields=>({...fields,tel:e.target.value}))}  />
        
        <input placeholder='Votre email ' type={'email'} onChange={e=>setinputs(fields=>({...fields,email:e.target.value}))}  />
        
        <input placeholder='Sneak peak ' onChange={e=>setinputs(fields=>({...fields,object:e.target.value}))}  />
        <button>Send it <BsArrowBarRight/> </button>
    </div>

  )
}

export default form
