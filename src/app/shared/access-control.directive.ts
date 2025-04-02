import { Directive, ElementRef, Input } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { CommonService } from '../services/common.service';

@Directive({
  selector: '[accessControl]'
})
export class AccessControlDirective {

  @Input("module") module?: string;
  @Input("submodule") subModule?: string;
  @Input("accessType") accessType?: string;
  customModule: any;
  allPermission:any= { };
  AllowPermission: any = {};
  constructor(private elementRef: ElementRef, private auth: AuthService, private CommonService: CommonService) {}

  ngOnInit() {
    this.allPermission = this.CommonService.getRolePermission();
    // this.elementRef.nativeElement.style.display = "none";
    this.checkAccess();
  }
  checkAccess() {
    const accessControls: any = this.auth.getUserDetails();
    if (accessControls?.data?.data?.
      user_role == 1) {
      this.elementRef.nativeElement.style.display = 'block'
      return;
    }

    this.AllowPermission = this.allPermission;

    if (this.accessType == "sidebar" && accessControls?.data?.data?.
      user_role==0) {
      this.elementRef.nativeElement.style.display = this.AllowPermission.hasOwnProperty(this.module) ? "block" : "none";
    }
    return false
  }

}
