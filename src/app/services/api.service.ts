import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

    private url: string;

    constructor(private http: HttpClient) {
        //set api url to blank in development mode as we are using proxy
        this.url = (environment.production)?environment.apiUrl:'';
    }

    public getAll<T>(urlParam: string): Observable<T> {
        return this.http.get<T>(this.url + '/' + urlParam);
    }

    public getById<T>(urlParam: string, id: number): Observable<T> {
        return this.http.get<T>(this.url + urlParam + '/' + id);
    }

    // public add<T>(urlParam: string, data: any): Observable<T> {
    //     return this.http.post<T>(this.url + '/' + urlParam, data);
    // }

    public post<T>(urlParam: string, data: any): Observable<T> {
        return this.http.post<T>(this.url + '/' + urlParam, data);
    }

    public postWithImage<T>(urlParam: string, data: any): Observable<T> {
        //avoid adding content type if image is uploading
        const httpHeaders = new HttpHeaders ({
         'isImageUpload': '1'
         // 'Accept': ''
        });

        return this.http.post<T>(this.url + '/' + urlParam, data,{ headers: httpHeaders });
    }

    public update<T>(urlParam: string, id: number, itemToUpdate: any): Observable<T> {
        return this.http
            .put<T>(this.url + '/' + urlParam +  '/' + id, itemToUpdate);
    }

    public delete<T>(urlParam: string, id: number): Observable<T> {
        return this.http.delete<T>(this.url + '/' + urlParam +'/'+ id);
    }

    public deleteAll<T>(urlParam: string, id: any): Observable<T> {
        return this.http.post<T>(this.url + '/' + urlParam , id);
    }
}