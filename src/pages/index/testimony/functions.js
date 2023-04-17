export const testimonials = [
    {
        img: "https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63ca56e99ae7593607210198_testimonial-01.png",
        name: "Mattew hunt",
        tag: "facebook",
        comment:
            "Customers support helped me promptly and made it easy to make the most ouf ot this theme i highly recommended this project.",
    },
    {
        img: "https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63ca56e99ae7593607210198_testimonial-01.png",
        name: "Mattew hunt",
        tag: "instagram",
        comment:
            "Customers support helped me promptly and made it easy to make the most ouf ot this theme i highly recommended this project.",
    },
    {
        img: "https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63ca56e99ae7593607210198_testimonial-01.png",
        name: "Mattew hunt",
        tag: "twitter",
        comment:
            "Customers support helped me promptly and made it easy to make the most ouf ot this theme i highly recommended this project.",
    },
    {
        img: "https://uploads-ssl.webflow.com/63c6818603ef9ce50c6d563d/63ca56e99ae7593607210198_testimonial-01.png",
        name: "Mattew hunt",
        tag: "whatsapp",
        comment:
            "Customers support helped me promptly and made it easy to make the most ouf ot this theme i highly recommended this project.",
    },
]

let nextIndex = 2;
let prevIndex = 0;
let lastAction
export let loading;

export const handleSlide = (direction, setSlides, containerRef) => {
    if (!loading) {
        loading = true
        let currentIndex;
        setTimeout(() => {
            let result = []
            if (direction === 'left') {
                currentIndex = nextIndex
                if (currentIndex + 3 < testimonials.length) {
                    result = testimonials.slice(currentIndex + 1, currentIndex + 4);
                } else {
                    result = testimonials.slice(currentIndex + 1).concat(testimonials.slice(0, 3 - (testimonials.length - currentIndex - 1)));
                }
                prevIndex = testimonials.indexOf(result[0]);
                nextIndex = testimonials.indexOf(result[result.length - 1]);
            } else if (direction === "right") {
                currentIndex = prevIndex
                if (currentIndex >= 3) {
                    result = testimonials.slice(currentIndex - 3, currentIndex);
                } else {
                    result = testimonials.slice(testimonials.length - (3 - currentIndex)).concat(testimonials.slice(0, currentIndex));
                }
                prevIndex = testimonials.indexOf(result[0]);
                nextIndex = testimonials.indexOf(result[result.length - 1]);
            }

            containerRef.current.scrollLeft = containerRef.current.offsetWidth;
            lastAction = direction
            setSlides(result)
            loading = false
        }, 600);
    }
}

