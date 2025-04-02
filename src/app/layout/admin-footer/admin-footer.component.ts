import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
    selector: 'app-admin-footer',
    templateUrl: './admin-footer.component.html',
    styleUrls: ['./admin-footer.component.css']
})
export class AdminFooterComponent {
    dashboardUrl: any = environment.dashboardUrl;

    ngAfterViewInit() {
        $(document).ready(() => {
            $(".copyrightCurrentYear").text((new Date).getFullYear());
        })
    }
}
