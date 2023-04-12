import React, { useEffect } from 'react'
import { gsap } from 'gsap'
const anim = () => {
    useEffect(()=>{
const t = gsap.timeline()
t.from(".animationup",{duration:.4}).from(".animationup",{y:1000,duration:1}).to(".animationup",{display:"none"}) 
t.play()  },[])
  return (
    <div class="animationup" style={{height:"100vh",width:"100vw",zIndex:"15"}}>
    <img style={{width:"100%",height:"100%",position:"absolute"}} src={"https://static.dezeen.com/uploads/2021/09/marble-bathroom-interiors-lookbook-hero-1.jpg"} alt=""/>
</div>
  )
}

export default anim
