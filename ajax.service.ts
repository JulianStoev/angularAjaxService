import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';

interface ajaxInterface {
  type?: 'post'|'get'|'upload';
  strgfy?: boolean;
  data?: any;
  cache?: boolean;
  rawData?: boolean;
  loader?: boolean;
  chat?: boolean;
  chatAuthKey?: string;
  handleErrors?: boolean;
  callback?: (arg0: any) => void;
}

interface uriInterface extends ajaxInterface {
  uri: string;
  url?: string;
}
interface urlInterface extends ajaxInterface {
  uri?: string;
  url: string;
}
type ajaxTypeInterface = urlInterface | uriInterface;

@Injectable({
  providedIn: 'root'
})
export class AjaxService {

  constructor(
    private http: HttpClient
  ) { }

  private readonly ajaxDefaults = {
    method: 'post', 
    strgfy: true,
    handleErrors: false,
    url: null,
    uri: null,
    rawData: false
  }

  public post(data: ajaxTypeInterface): void {
    data.type = 'post';
    this.ajax(data);
  }
  public get(data: ajaxTypeInterface): void {
    data.type = 'get';
    this.ajax(data);
  }

  private ajax(_data: ajaxTypeInterface): any {
    const data:ajaxTypeInterface = Object.assign({}, JSON.parse(JSON.stringify(this.ajaxDefaults)), _data);
    const headers = {} as any;

    if (data.strgfy) {
      headers['Content-Type'] = 'application/json';
    }

    // add your auth code here
    // headers['authentication'] = 'myauth';

    const options: any = {
      observe: 'response',
      headers: new HttpHeaders(headers)
    };

    if (data.uri) {
      data.url = data.uri;
    }

    switch(data.type) {
      case 'get':
        if (!data.cache) {
          data.data = '_=' + new Date().getTime() + (data.data != '' ? '&' + data.data : '');
        }
        if (data.data != '') {
          data.data = '?' + data.data;
        }
        this.http.get(data.url + data.data, options).subscribe(
          (success: ArrayBuffer) => {
            this.ajaxResponse(success as any, data);
          },
          (error: HttpErrorResponse) => {
            this.handleError(error);
          }
        );
        break;

      default:
        this.http.post(data.url!, data.data, options).subscribe(
          (success: ArrayBuffer) => {
            this.ajaxResponse(<any>success, data);            
          },
          (error: HttpErrorResponse) => {
            this.handleError(error);
          }
        );
    }
  }

  private ajaxResponse(response: HttpResponse<any>, data: ajaxInterface): void {
    if (!response || !response.body) {
      alert('There was no response from the server');
      return;
    }

    if (response.body.auth === 0) {
      alert('Session lost');
      return;
    }

    if (data.handleErrors && response.body.success == 0) {
        alert(response.body.message ? response.body.message + '<br />' + response.body.sql : 'An error occured');
      return;
    }

    if (typeof data.callback == 'function') {
      data.callback(response.body);
    }
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.error instanceof ErrorEvent) {
        alert('An error occurred: ' + error.error.message.toString());
    } else {
      if (error.status == 200) {
        alert(error.error.text);
      } else {
        alert('Backend returned code ' + error.status);
      }
    }
  };
}
