import React, { useState } from "react";
import "./FAQ.css";
import bc from '../../assets/sounds/dropdown.mp3'


const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map(({ title, content }, index) => (
        <AccordionItem 
        key={index}
         title={title} 
        content={content}
         toggleAccordion={()=>toggleAccordion(index)} isOpen={activeIndex===index} />
      ))}
    </div>
  );
};
const AccordionItem = ({ title, content ,toggleAccordion,isOpen}) => {
  ;
  const handlesound=()=>{
    const sound = new Audio(bc);
    sound.play();
  }
  const handlecombinedclick=()=>{
    toggleAccordion();
    handlesound()
  }


  return (
    <div className={`accordion-item ${isOpen ? "open" : ""}`}>
      <button type="button" id="mybutton" onClick={handlecombinedclick}>
        {title}
       
      </button>
      {isOpen &&(<div className="accordion-content ">
        {content}
      </div>)}
    </div>
  );
};
// var button = document.getElementById("myButton");
// var sound = new Audio("button-click.mp3");

// button.addEventListener("click", function() {
//   sound.play();
// });
const items = [
  {
    title: "What should I use for everyday cleaning of my granite?",
    content:
      "Rather than purchasing the expensive granite cleaner or polish, you can use everyday household items to clean your stone on a routine basis. The best thing to clean with is clean water on a sponge, or windex with a paper towel.",
  },
  {
    title: "How can I Keep my kitchen's coutertop shining? ",
    content:"The key to keeping marble countertops gorgeous and looking fresh is prevention: Place heat-resistant pads under hot dishes, use coasters for glasses and never cut directly on the surface. Also, wipe up any spills right away, as marble is susceptible to etching from acids and stains from other substances. On a daily basis, wipe marble with a soft cloth and warm water, using a mild cleanser if necessary. It’s recommended that you purchase a cleaning product specifically formulated for marble. This surface should be sealed periodically to keep it in good shape. All marble surfaces can be re-polished in your home to restore them to a new look at any interval you wish."  },
  {
    title: "If I do have a stain, can it be removed?",
    content:
      "Yes, in many cases you are able to pull out a stain with a poultice solution. A poultice is a combination of ingredients, custom prepared for each staining situation. At Great Lakes Granite and Marble, we will prepare the correct poultice for the individual stain that is being addressed.",
  },
  {
    title: " What types of foods, liquids, or materials are most likely to stain your counter?",
    content:"The number one enemy of natural stone are oil based products, oils of all kinds, fats, and butter. The second highest offender would be moisture migration, meaning anytime you have moisture on the surface for any length of time, you run the risk of the moisture seeping into the stone. Higher acidity liquids such as coffee, tea, soda, citrus juice, wine, some salad dressings can affect marble. The acid actually reacts with calcium carbonate in the marble, causing an etching in the stone. This would require bringing in a professional to remove the stain and restore the polish on the marble. Again, this is an issue that is specific to marble. We would compare marble to selecting a fine wood top for a coffee table, dining table or piece of fine furniture. It looks beautiful, but will require care and upkeep to maintain it’s pristine look."  },
];

export default function FAQ() {
  return (
    <div className="container">
      <h1>FAQ</h1>
      <Accordion items={items} />
    </div>
  );
}
