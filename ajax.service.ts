// Ajax Service v1.1
// https://github.com/JulianStoev/angularAjaxService

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';

interface ajaxInterface {
  contentJson?: boolean;
  data?: any;
  noCache?: boolean;
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
interface headersInterface {
  [name: string]: string | string[];
}
type acceptedMethodsInterface = 'post' | 'get' | 'put' | 'delete' | 'head' | 'options';

@Injectable({
  providedIn: 'root'
})
export class AjaxService {

  constructor(
    private http: HttpClient
  ) { }

  private readonly ajaxDefaults = {
    contentJson: true
  };

  public post(data: ajaxTypeInterface): void {
    this.ajax(data, 'post');
  }
  public get(data: ajaxTypeInterface): void {
    this.ajax(data, 'get');
  }
  public put(data: ajaxTypeInterface): void {
    this.ajax(data, 'put');
  }
  public delete(data: ajaxTypeInterface): void {
    this.ajax(data, 'delete');
  }
  public head(data: ajaxTypeInterface): void {
    this.ajax(data, 'head');
  }
  public options(data: ajaxTypeInterface): void {
    this.ajax(data, 'options');
  }

  private ajax(_data: ajaxTypeInterface, method: acceptedMethodsInterface): void {
    const data = this.prepare.data(_data, method);
    const options = this.prepare.headers(data);

    switch(method) {
      case 'get':
      case 'head':
      case 'options':
      case 'delete':
        this.http[method](data.url, options).subscribe(
          (success: ArrayBuffer) => {
            this.handle.response(success as any, data);
          },
          (error: HttpErrorResponse) => {
            this.handle.error(error);
          }
        );
        break;

      case 'post':
      case 'put':
        this.http[method](data.url, data.data, options).subscribe(
          (success: ArrayBuffer) => {
            this.handle.response(success as any, data);
          },
          (error: HttpErrorResponse) => {
            this.handle.error(error);
          }
        );
        break;        
    }
  }

  private readonly prepare = {
    data: (data: ajaxTypeInterface, type: acceptedMethodsInterface): ajaxTypeInterface => {
      if (data.uri) {
        data.url = data.uri;
      }

      if (type === 'get') {
        if (data.noCache) {
          data.data = `_=${new Date().getTime() + (data.data ? `&${data.data}` : '')}`;
        }
        data.url += `?${data.data}`;
      }

      return {...this.ajaxDefaults, ...data};
    },
    headers: (data: ajaxTypeInterface) => {
      const headers = {} as headersInterface;

      // headers.Authentication = 'your token';

      if (data.contentJson) {
        headers['Content-Type'] = 'application/json';
      }
      return {
        observe: 'response',
        headers: new HttpHeaders(headers)
      } as any;
    }
  };

  private readonly handle = {
    response: (response: HttpResponse<any>, data: ajaxTypeInterface): void => {
      if (!response || !response.body) {
        alert('There was no response from the server');
        return;
      }
      if (data.callback) {
        data.callback(response.body);
      }
    },
    error: (error: HttpErrorResponse): void => {
      if (error.error instanceof ErrorEvent) {
        alert(`An error occurred: ${error.error.message.toString()}`);
        return;
      }
      if (error.status === 200) {
        alert(error.error.text);
        return;
      }
      alert(`Backend returned code ${error.status}`);
    }
  };

}
