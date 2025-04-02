import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = new Subject<boolean>();
  customLoading = new Subject<boolean>();

  constructor() { }

  show() {
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }


  customShow() {
    this.customLoading.next(true);
  }

  customHide() {
    this.customLoading.next(false);
  }

}
