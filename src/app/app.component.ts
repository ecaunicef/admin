import { Component } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from './services/loader.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    title = 'Datamanager';
    loadingRouteConfig!: boolean;
    subscription!: Subscription;
    isCustomLoaderActive = false;

    constructor(private router: Router,
        private loaderService: LoadingService
    ) {
        this.subscription = this.loaderService.isLoading.subscribe((res: any) => {
            // this.loadingRouteConfig = res;
            // report-generate
            // if (this.router.url.includes("/data-exchange/primary") || this.router.url.includes("/snapshot")) {
            if (this.router.url.includes("/report-generate") || this.router.url.includes("/data-exchange/primary") || this.router.url.includes("/snapshot") || this.router.url.includes("/commonframe") || this.router.url.includes("/supplementary-frame") || this.router.url.includes("/surveyframe") || this.router.url.includes("/export-data") ||this.router.url.includes("/import-data") ) {
                // this.loadingRouteConfig = false;            
            } else {
                if (this.isCustomLoaderActive == false) {
                    this.loadingRouteConfig = res;  
                }
                
            }
        })


        this.subscription = this.loaderService.customLoading.subscribe((res: any) => {
            this.isCustomLoaderActive = res;
            this.loadingRouteConfig = res;
        })

    }

    keyCode(event: any) {
        var x = event.keyCode;

        if (x == 27) {
            alert("You pressed the Escape key!");
        }
    }

    ngOnInit() {

        this.router.events.subscribe(event => {
            if (event instanceof RouteConfigLoadStart) {
                this.loadingRouteConfig = true;
            } else if (event instanceof RouteConfigLoadEnd) {
                this.loadingRouteConfig = false;
            }
        });

        if (localStorage.getItem("locale") == null || localStorage.getItem("locale") == undefined) {
            localStorage.setItem('locale', 'en')
        }
    }


}