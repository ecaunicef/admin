import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})

export class AdminLayoutComponent {
  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {

      // this.activatedRoute.data.subscribe(
      //   ({token}) => {
      //       console.log(token);
      //   });
      //console.log(this.authService.getUserDetails());
  }
}
