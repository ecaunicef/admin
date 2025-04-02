import {inject} from '@angular/core';
import { Router, CanActivateFn, CanMatchFn, CanActivateChildFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { CommonService } from '../services/common.service';


export const fetchUserData: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const commonService = inject(CommonService);
  if(authService.isLoggedIn()){
    return true;
  }
  return inject(AuthService).fetchUserCredentials();
};

const isAuthenticated = (route:any, state:any) => {
  const commonService = inject(CommonService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const access = route.data['module'];
  const AllPermissiontemp:any = commonService.getRolePermission();
  const userDetails = authService.getUserDetails();

  let AllowPermission = AllPermissiontemp;

  if(userDetails?.data?.data?.user_role ==1){
    return true
  }


  const module = AllowPermission.hasOwnProperty(access.module);
  if(module == undefined) {
    return router.parseUrl('/');
  } 
  return true;
};


export const canActivate: CanActivateChildFn = (route, state) => {
  return isAuthenticated(route, state);
};

export const canMatch: CanMatchFn = (route, state) => {
  return isAuthenticated(route, state);
};


export const checkGuestUser: CanActivateFn = (route, state) => {
// return false
  //Ignore guest check api if logout from application
  if(route.queryParams.hasOwnProperty('logout')) {
    return true;
  }

  // const authService = inject(AuthService);
 
 return inject(AuthService).isGuestUser();
};
