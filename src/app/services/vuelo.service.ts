import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VueloService {

  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getData(){
    let request = this.http.get(`${this.url}/`);

    return new Promise((resolve, reject) => {
      request.subscribe(
        (response) => {
          if (response) {
           
            resolve(response);
          } else {
            resolve({message: response['message'], error : response['errors'] });
          }
        },
        (error: any) => {
          resolve(error);
        }
      );
    });
  }


}
