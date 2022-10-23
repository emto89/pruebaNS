import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormControl, Validators } from '@angular/forms';
import { validarCamposIguales } from './validators';
import { VueloService } from '../services/vuelo.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Flight } from '../interfaces/flight';
import { Transport } from '../interfaces/transport';
import { Journey } from '../interfaces/journey';
import { CurrencyService } from '../services/currency.service';


@Component({
  selector: 'app-vuelo',
  templateUrl: './vuelo.component.html',
  styleUrls: ['./vuelo.component.scss']
})
export class vueloComponent implements AfterViewInit {

  formItems: FormGroup;
  options: string[] = [];
 /** options: any[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  filteredOptionsOrigen: Observable<string[]> = new Observable<string[]>();
  filteredOptionsDestino: Observable<string[]> = new Observable<string[]>(); */
  

  journey = {} as Journey;
  flights: Flight[] = [];
  showJourney = false;
  error: string = ''; 
  errorForm: string = '';
  tipoMonedas: Array<any> = [];
  
  
  formLines = this._fb.group({
    origen: ['',  [Validators.required]],
    destino: ['',  [Validators.required]],
    selMoneda:['']
  },
  {
    validator: validarCamposIguales('origen','destino')
  }
  );

  origen = new FormControl('');
  destino = new FormControl('');

  constructor(private currencyService: CurrencyService, private _fb: FormBuilder, private _vueloService: VueloService){
    this.formItems = new FormGroup({
      origen: this.origen,
      destino: this.destino
   });

   
   
  }

  ngOnInit() {

    this.cargarVuelos();  
    this.obtenerTipoMonedas();  
  }

  ngAfterViewInit() {}
 /***
  * 
  * funcion para consultar el api de vuelos y  almacernarlos en objetos
  * 
  */
  async cargarVuelos(){
    
    let vuelos:any = await this._vueloService.getData();
    vuelos.forEach( (element:any) => {
      let flight = {} as Flight;
      let transport = {} as Transport;
       transport.flightCarrier = element['flightCarrier'];
       transport.flightNumber = element['flightNumber'];
       flight.transport = transport;
       flight.origin = element['departureStation'];
       flight.destination = element['arrivalStation'];
       flight.price = element['price'];
      this.flights.push(flight);
    });

    this.cargarRutas();

  }
  /**
   *  
   * esta funcion permite cargar en los select de origen y destino la informacion necesaria
   * para llenarlos
   * 
   */
   cargarRutas(){

      this.flights.forEach( (element:Flight) =>{  
          if(!this.options.includes(element.origin) ){
              this.options.push(element.origin);
          }
          if(!this.options.includes(element.destination) ){
            this.options.push(element.destination);
        }
      });
   }

  /**
   *  funcion que es ejecutada al momento de buscar los vuelos
   */
  buscarVuelos(){

    this.cargarVuelos(); 

    let origen:string = this.formLines.controls['origen'].value;
    let destino:string = this.formLines.controls['destino'].value;
    let origenes: string[] = [];
    let rutaOrigenes: string [] = [];
  
    origen = origen.toUpperCase();
    destino = destino.toUpperCase();

    let vuelosValidos = this.buscarRutaVuelos(this.flights,'origen',origenes,origen);

    rutaOrigenes = this.validacionVuelos(0,vuelosValidos,origen,destino,origenes);
    if(rutaOrigenes.includes(origen) && rutaOrigenes.includes(destino)){

      this.buscarJourney(this.journey,rutaOrigenes);
      this.journey.origin = origen;
      this.journey.destination = destino;
     
      this.showJourney = true;

    }else{
      this.showJourney = false;
      this.error = 'No se encontraron rutas para esta busqueda';
    } 
     
  }
/**
 * 
 * @param idx 
 * @param vuelosValidos 
 * @param origen 
 * @param destino 
 * @param origenes 
 * @returns  la ruta a tomar para ir de origen a destino.
 */
  validacionVuelos(idx: number = 0, vuelosValidos: Flight[], origen: string,destino: string,origenes: string[]){
        if(!origenes.includes(destino)){
           
          if(vuelosValidos.length <= 0){
            return [];
          }

          let destinoValido = this.buscarRutaVuelos(vuelosValidos,'destino',origenes,destino);

          if(destinoValido.length > 0){
            
            if(!origenes.includes(origen)){
              origenes.push(origen);
              origenes.push(destino); 
            }else{
              origenes.push(destino); 
            }
            return origenes;
          }else{
            if(!origenes.includes(origen)){
              origenes.push(origen); 
            }
                        
            let rutaTemporal = this.buscarRutaVuelos(this.flights,'origen',origenes,vuelosValidos[idx].destination); 
            let resp = this.validacionVuelos(idx,rutaTemporal,vuelosValidos[idx].destination,destino,origenes);       
            
            if( resp.length == 0  ){
                this.validacionVuelos(idx+1,vuelosValidos,vuelosValidos[idx+1].destination,destino,origenes);              
            }
          }
        }
    
    return origenes;
  }
  /**
   * funcion para buscar vuelos que cumplan con las condiciones de ir de un punto a otro.
   * 
   * @param flights 
   * @param condicion 
   * @param origenes 
   * @param filtro 
   * @returns  retorna los vuelos que cumplan las condiciones 
   */

  buscarRutaVuelos(flights: Flight[],condicion: string, origenes: string[] = [], filtro: string = ''){
    if(condicion === 'origen'){
      
      return flights.filter( (items:Flight) =>{
        return items.origin === filtro && !origenes.includes(items.destination);
      });
    }
    if(condicion === 'destino'){
      return flights.filter( (items:Flight) =>{
        return items.destination === filtro
      });
    }
    return [];
  }

  buscarJourney(journey: Journey, rutas: string[]){
    let precio = 0;
    let vuelos: Flight[] = [];
    for (let index = 0; index < rutas.length-1; index++) {
      let vuelo: Flight = this.filtroVuelo(rutas[index],rutas[index+1])[0];
      precio +=vuelo.price;
      vuelos.push(vuelo);
    }
    journey.flight = vuelos;
    journey.price = precio;
   return vuelos; 

  }

  filtroVuelo(origen: string, destino: string){
    return this.flights.filter( (items:Flight) =>{
      return items.origin === origen && items.destination === destino;
    });
  }

  obtenerTipoMonedas() {
    this.currencyService.getCurrencies().subscribe(({ rates }) => {

      this.tipoMonedas = Object.values(rates).map((value: any, index: number) => {
        return {
          symbol: Object.keys(rates)[index],
          value
        }
      })
    })
  }

  cambiarMoneda(){
    this.currencyService.setCurrency(this.formLines.controls['selMoneda'].value.symbol,this.formLines.controls['selMoneda'].value.value);

  }
  
}
