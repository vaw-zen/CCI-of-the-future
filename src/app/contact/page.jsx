import React from "react";
import styles from './page.module.css'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Actions from "./1-actions/actions";
import Welcome from "./2-welcoming/welcome";
import Form from "./3-form/form";
import GreenBand from '@/utils/components/GreenBand/GreenBand';
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
      <Actions />
      <Welcome/>
      <Form/>
   
    </>
  );
}
