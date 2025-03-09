import { servicesSI } from "./sections/3-services/services.func";

export function homeScrollTriggers() {
    // Call servicesSI for home page animations
    servicesSI();
    console.log('homeScrollTriggers initialized');
}
