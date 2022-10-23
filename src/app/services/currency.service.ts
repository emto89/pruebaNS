import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  public currency = { symbol: 'USD', value: 1 }

  currency$: BehaviorSubject<any> = new BehaviorSubject<any>(this.currency)

  constructor(private http: HttpClient) {

  }

  setCurrency(symbol: string, value: number): void {
    const data = {
      symbol,
      value
    }

    this.currency$.next(data)
  }

  getCurrencies(): Observable<any> {
    return this.http.get('https://v1.nocodeapi.com/leifermendez/cx/EWBnLVhPRyGHNdDn/rates')
  }


}
