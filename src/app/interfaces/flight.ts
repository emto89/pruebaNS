import { Transport } from "./transport";

export interface Flight {
    transport: Transport,
    origin: string,
    destination: string,
    price: number
}
