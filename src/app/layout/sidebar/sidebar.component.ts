import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
    
    currentRoute: string = '';
    constructor(private router: Router, public route: Router,) {
        // Detect route changes to keep accordion open
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            this.currentRoute = event.urlAfterRedirects;
          }
        });
      }

   
  // Check if the accordion should be open based on the current route
  isAccordionOpen(accordionKey: string): boolean {
    switch (accordionKey) {
      case 'mobile-data':
        return this.currentRoute.includes('/users') || 
               this.currentRoute.includes('/counselling')||
               this.currentRoute.includes('/feedback')||
               this.currentRoute.includes('/mood-trackers');
      case 'admin':
        return this.currentRoute.includes('/credential') || 
               this.currentRoute.includes('/area-list') || 
               this.currentRoute.includes('/classification') || 
               this.currentRoute.includes('/helpline') || 
               this.currentRoute.includes('/blog') || 
               this.currentRoute.includes('/customize') || 
               this.currentRoute.includes('/language') || 
               this.currentRoute.includes('/mood-mapper') ||
               this.currentRoute.includes('/category');
      default:
        return false;
    }
  }



    sidebar = false;

    sidebarToggle() {
        this.sidebar = !this.sidebar;

        $('.mainContent').toggleClass('mainContentWidth')
        $('.mainFooter').toggleClass('mainFooterWidth')
    }

    ngAfterViewInit() {
        $(document).ready(() => {
            $("body").click(function () {
                $(".menuThirdLevel").removeClass("show");
            });

            $(".sidebarDropdown > ul > li > ul > li > a").click(function (this: any) {
                $(this).parent().parent().removeClass("show");
            });
        });
    }
}
