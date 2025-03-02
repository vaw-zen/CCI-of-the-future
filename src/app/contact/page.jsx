import React from "react";
import styles from "./contact.module.css";
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";

export default function ContactPage() {
  const socials = {
    facebook: "https://www.facebook.com/your-profile",
    twitter: "https://twitter.com/your-profile",
    linkedin: "https://www.linkedin.com/in/your-profile",
    instagram: "https://www.instagram.com/your-profile",
  };

  return (
    <>
      <HeroHeader title="Contact Us" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 15.975vw",
          gap: "84px",
          paddingTop: "110px",
          paddingBottom: "105px",
        }}
      >
        <div style={{ display: "flex", height: "204px", width: "100%" }}>
          <div style={{ flex: "1" }}>
            <h3
              style={{
                marginTop: "0px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#cafb42",
                fontSize: "16px",
                lineHeight: "26px",
                textTransform: "uppercase",
              }}
            >
              CONTACT US
            </h3>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "64px",
                lineHeight: "74px",
                textTransform: "none",
              }}
            >
              We'd love to hear from you.
            </h2>
          </div>
          <div style={{ flex: 1,display:"flex",flexDirection:"column",justifyContent:"center" }}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "15px",
                fontSize: "24px",
                lineHeight: "30px",
              }}
            >
              Get in touch and let's create together
            </h3>

            <ul
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                width: "650px",
                listStyle: "none",
              }}
            >
              {Object.entries(socials).map(([key, url]) => (
                <li
                  style={{
                    fontSize: "18px",
                    lineHeight: "28px",
                    textAlign: "left",
                    fontWeight: 700,
                  }}
                  key={key}
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", height: "328px", width: "100%" }}>
          <div style={{ flex: "1" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.571224004497!2d10.25237407668787!3d36.852743772232266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa2d22c796dfcf437%3A0x7dec63fbbbefa5c2!2sChaabane&#39;s%20Cleaning%20Intelligence!5e0!3m2!1sen!2stn!4v1740873409556!5m2!1sen!2stn"
              width="100%"
              height="100%"
              // style="border:0;"
              // allowfullscreen=""
              loading="lazy"
              // referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              background: "green",
              width: "100%",
              padding: "1vw 0",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1",
                background: "black",
              }}
            >
              <div style={{ flex: "1", background: "white" }}></div>
              <div style={{ flex: 1, background: "blue" }}></div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1",
                background: "yellow",
              }}
            >
              <div style={{ flex: 1, background: "red" }}></div>
              <div style={{ flex: 1, background: "#cafb42" }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
