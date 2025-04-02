import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoadingService } from './loader.service';
import { finalize } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { CommonService } from './common.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class CustomInterceptorService implements HttpInterceptor {

  constructor(private route: Router, public loaderService: LoadingService,
    private toastr: ToastrService, private commonService: CommonService,
    private transloco : TranslocoService
    ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    
    
    const re = /login/gi;

    const urlLoaderRestriction = ['login', 'last-upload-file', 'get_import_progress','get-download-status'];
    let activateLoader = true;
        
    // Exclude interceptor for login request:
    if (urlLoaderRestriction.some(v => req.url.includes(v))) {
      activateLoader = false;        
    }
    // Exclude interceptor for login request:
    if (req.url.search(re) === -1) {

        if(req.headers.get('isImageUpload') == '1') {
            //req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        } else {
            //console.log(req.headers)
            if (!req.headers.has('Content-Type')) {

                if (req.url.search('simple-file-upload') === -1 && req.url.search('edit-register-dsd') === -1) {
                    req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
                }

                req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
            }
        }
        req = req.clone({
            withCredentials: true
        });
        
        req = req.clone({ headers: req.headers.set('Locale', `${localStorage.getItem("locale")}`) });

        if(activateLoader){
          this.loaderService.show();  
        }
        
        return next.handle(req).pipe(
            
            catchError((error: HttpErrorResponse) => {
                switch (error.status) {
                    case 401:
                      
                        localStorage.clear();
                        const message = 'Your session has expired. Please log in again to continue.';
                        this.route.navigate(['/'], { queryParams: { message: message } });

                        // this.transloco.selectTranslateObject('internal_server_error').subscribe((res:any)=>{

                        //   this.toastr.error(res);
                        //   localStorage.clear();
                        //   this.route.navigate(["/"]);
  
                        // })
                      // this.route.navigate(["/server-error"]);

                        // this.commonService.logOut();
                        break;
                    case 404:
                      // this.toastr.error(error.error.message);
                      // localStorage.removeItem('auth_token');
                      this.route.navigate(["/pagenotfound"]);
                      // this.commonService.logOut();
                      break;
                    case 400:
                      this.transloco.selectTranslateObject('internal_server_error').subscribe((res:any)=>{
                        this.toastr.error(res);
                        localStorage.clear();
                        // this.route.navigate(["/"]);
                        // this.commonService.logOut();
                      this.route.navigate(["/"]);

                      })
                        
                        break;
                    case 500:
                      this.transloco.selectTranslateObject('internal_server_error').subscribe((res:any)=>{
                        this.toastr.error(res);
                        localStorage.clear();
                        // this.route.navigate(["/"]);
                        // this.commonService.logOut();
                      this.route.navigate(["/server-error"]);
                      })
                        break;
                  default:
                }
    
                console.warn(
                  'Error caught inside interceptor',
                  error
                );
                
                if(activateLoader){
                  this.loaderService.hide();  
                }

                if (error.status != undefined) {
                    let errorMessage = '';
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        errorMessage = `Error: ${error.error.message}`;
                    } else {
                        // server-side error
                        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                    }
                    //window.alert(errorMessage);
                  return throwError(() => errorMessage);
                } else {
                  return throwError(() => error); 
                }
                
            }),
            finalize(() => {
              if(activateLoader){
                this.loaderService.hide();  
              }
            })
        ) 
    }

    return next.handle(req);
      
  };

}