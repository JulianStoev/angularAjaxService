import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';

interface ajaxInterface {
  type?: 'post' | 'get';
  strgfy?: boolean;
  data?: any;
  cache?: boolean; // in case of GET it adds extra params to the url to avoid caching response...cough...Safari...cough
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
    url: null,
    uri: null
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
    
    const ajaxResponse = (response: HttpResponse<any>, data: ajaxInterface): void => {
      if (!response || !response.body) {
        alert('There was no response from the server');
        return;
      }
      if (response.body.auth === 0) {
        alert('Session lost');
        return;
      }
      if (typeof data.callback == 'function') {
        data.callback(response.body);
      }
    };
    
    const handleError = (error: HttpErrorResponse): void => {
      if (error.error instanceof ErrorEvent) {
        alert('An error occurred: ' + error.error.message.toString());
        return;
      }
      if (error.status == 200) {
        alert(error.error.text);
      } else {
        alert('Backend returned code ' + error.status);
      }
    };

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
            ajaxResponse(success as any, data);
          },
          (error: HttpErrorResponse) => {
            handleError(error);
          }
        );
        break;

      default:
        this.http.post(data.url!, data.data, options).subscribe(
          (success: ArrayBuffer) => {
            ajaxResponse(success as any, data);            
          },
          (error: HttpErrorResponse) => {
            handleError(error);
          }
        );
    }
  }

}
