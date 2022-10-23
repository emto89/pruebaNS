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
  filteredOptionsOrigen: Observable<string[]> = new Observable<string[]>();
  filteredOptionsDestino: Observable<string[]> = new Observable<string[]>();

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
    console.log("Opciones ",this.options);

    this.filteredOptionsOrigen = this.origen.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    
    this.filteredOptionsDestino = this.destino.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );    
   
  }
  private _filter(value: string): string[] {
    const filterValue = value.toUpperCase();
    console.log(filterValue," val ",this.options);
    return this.options.filter(option => option.toUpperCase().includes(filterValue));
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
      console.log("RUtas", this.options);

   }

  /**
   *  funcion que es ejecutada al momento 
   */
  buscarVuelos(){

    this.cargarVuelos(); 

    let origen:string = this.formLines.controls['origen'].value;
    let destino:string = this.formLines.controls['destino'].value;
    //let journey = {} as Journey;
    let origenes: string[] = [];
    let rutaOrigenes: string [] = [];
  
    origen = origen.toUpperCase();
    destino = destino.toUpperCase();

    let vuelosValidos = this.buscarRutaVuelos(this.flights,'origen',origenes,origen);

    rutaOrigenes = this.validacionVuelos(0,vuelosValidos,origen,destino,origenes);
    console.log(rutaOrigenes);
    if(rutaOrigenes.includes(origen) && rutaOrigenes.includes(destino)){

      this.buscarJourney(this.journey,rutaOrigenes);
      this.journey.origin = origen;
      this.journey.destination = destino;
      console.log("this.journey",this.journey);
      this.showJourney = true;

    }else{
      this.showJourney = false;
      this.error = 'No se encontraron rutas para esta busqueda';
    } 
     
  }

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
            /*console.log("vuelos",vuelosValidos.length);
            console.log("==========idx==========",idx);
            console.log("==========origenes==========",origenes);
            console.log("====================",vuelosValidos);*/
            
            let rutaTemporal = this.buscarRutaVuelos(this.flights,'origen',origenes,vuelosValidos[idx].destination); 
            let resp = this.validacionVuelos(idx,rutaTemporal,vuelosValidos[idx].destination,destino,origenes);       
            
            if( resp.length == 0  ){
              //origenes.pop();
                this.validacionVuelos(idx+1,vuelosValidos,vuelosValidos[idx+1].destination,destino,origenes);              
            }
          }
        }
    
    return origenes;
  }

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
    if(condicion === 'validacion'){
      return flights.filter( (items:Flight) =>{
        return !origenes.includes(items.destination);
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
