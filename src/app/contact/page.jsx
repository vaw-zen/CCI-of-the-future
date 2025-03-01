import React from 'react'
import styles from "./contact.module.css"
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'

export default function ContactPage() {
  return (
    <>
      <HeroHeader title="Contact Us" />
      <div style={{display:"flex",flexDirection:"column",padding: "0 15.975vw",gap:"84px" }}>
     
        <div style={{display:"flex",height:"204px",width:"100%"}}  >
        <div style={{flex:"1", background:"red"}}></div>
        <div style={{flex:1, background:"blue"}}></div>
        </div>
        <div style={{display:"flex",height:"328px",width:"100%"}}  >
        <div style={{flex:"1", background:"white"}}></div>
        <div style={{display:"flex",flex:1, background:"green",width:"100%",padding:"1vw 0"}}>
          <div  style={{display:"flex",flexDirection:"column", flex:"1", background:"black"}}>
          <div style={{flex:"1", background:"white"}}></div>
          <div style={{flex:1, background:"blue"}}></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",flex:"1", background:"yellow"}}>
          <div style={{flex:1, background:"red"}}></div>
          <div style={{flex:1, background:"#cafb42"}}></div>
          </div>
        </div>
        </div>
    
      </div>
     
    </>
  )
}
