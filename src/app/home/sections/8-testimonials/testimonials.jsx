import content from './testimonials.json'
import TestimonialsClient from './csr/testimonialsClient'

export default function Testimonials({ className }) {
    return (
        <TestimonialsClient 
            className={className}
            backgroundImage={content.img}
        />
    )
}