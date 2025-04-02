import { Injectable } from '@angular/core';
// import jwt_decode from 'jwt-decode';
import { ApiService } from '../api.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
 
export class AuthService {
  
  authDetails:any = undefined;
  url:string = '';
  tempUserDetailsForNewUserAndPaaswordExpired:any = null

  

  constructor(private apiService: ApiService, private route:Router, private redirectService: CommonService) {
    this.url = environment.apiUrl;
  }

  isLoggedIn(): boolean {
    return(this.authDetails == undefined)?false:true;
  }

  isAdminLoggedIn(): boolean {
     return true;
  }

  /*
  Decode token
  Return true if token expired, invalid token or localstorage not set 
  */
  isTokenExpire(){
    // isTokenExpire():boolean{

    // let isExpired =  false, isTokenDecode = false;

    // if(this.authDetails == undefined) {
    //   if(localStorage.getItem('auth_token')) {
    //     const token:any = localStorage.getItem('auth_token');
    //     try {
    //       this.authDetails = jwt_decode(token);
    //       isTokenDecode = true;
    //     } catch(Error) {
    //       isExpired = true;
    //     }
    //   } else { isExpired = true;};
    // } else {
    //   isTokenDecode = true;
    // }

    // if(isTokenDecode) {

    //   //Token return utc time in milisecond
    //   if(Date.now() >= (this.authDetails.exp * 1000)) {
    //     isExpired = true;
    //   }
    // }
    
    // return isExpired;
  }

  setUsetDetails(data:any){
    this.authDetails = data;
  }

  getUserDetails(){
    return this.authDetails;
  }

  setUsetDetailsForNewUserAndPaaswordExpired(data:any){
    this.tempUserDetailsForNewUserAndPaaswordExpired = data;
  }

  getUserDetailsForNewUserAndPaaswordExpired(){
    return this.tempUserDetailsForNewUserAndPaaswordExpired;
  }

  fetchUserCredentials(): Promise<boolean>  {
    return new Promise((resolve) => {
        this.apiService.getAll("api/data-retrieval/users/details").subscribe((res:any) => {
          if(res.status == 1) {
                this.setUsetDetails(res);
          } else {
              this.route.navigate(['/']);
          }

            return resolve(true); 
                  
        });
        
    });

 
  }

  isGuestUser(): Promise<boolean>  {
    return new Promise((resolve) => { this.apiService.getAll("api/data-retrieval/users/details").subscribe((res:any) => {
      if (res.status == 1) {
    
        this.setUsetDetails(res);
        this.route.navigate(['/landing']);
      }
      return resolve(true); 
            
  });
});

  // this.apiService.()
  
}


redirectFun(subModule:any){
  this.redirectService.redirect(subModule)
}
  


}