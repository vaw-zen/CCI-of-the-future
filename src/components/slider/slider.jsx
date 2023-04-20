import React, { useEffect, useState } from 'react'

import { IoIosArrowBack, IoIosArrowForward} from "react-icons/io/index.js";
const slider = ({imgArray}) => {
    const [counter,setcounter]=useState(0)
    useEffect(()=>{
        var slider = new BeerSlider( document.getElementById( "beer-slider" ) );
          
    },[])
  return (
       <>
       

    <div id="beer-slider" class="beer-slider" style={{maxWidth:"800px",height:"auto"}}>
        <img style={{width:"900px",height:"auto"}}src={imgArray[counter].firstimgSlider} alt=""/>
        <div class="beer-reveal">
          <img style={{width:"900px",height:"auto"}} src={imgArray[counter].secimgSlider} alt=""/>
        </div>
    </div>
    <div class="leftRight" style={{

    backgroundColor: '#000',
    display: "flex",
    justifyContent: "center"
   

}}>
       
        <IoIosArrowBack style={{cursor:"pointer"}}   onClick={e=>{
            if (counter-1>=0) return setcounter(i=>i-1)
            return  setcounter(imgArray.length-1)
           } }  /> 
        <IoIosArrowForward style={{cursor:"pointer"}} onClick={e=>{
            if (counter+1<imgArray.length) return  setcounter(i=>i+1)
            return  setcounter(0)
           } }    />
    </div>
</>
  )
}

export default slider
