import { Flight } from "./flight";

export interface Journey {

    flight: Flight[],
    origin: string,
    destination: string,
    price: number
}
