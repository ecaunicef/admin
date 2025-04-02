import { Component } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

    ngAfterViewInit() {
        $(document).ready(() => {
            $(".copyrightCurrentYear").text( (new Date).getFullYear() );
        })
    }

    redirect(){
        alert("")
    }
}
