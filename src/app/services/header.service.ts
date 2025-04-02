import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private title = new Subject(); // Initialize with empty string
  private set_area = new Subject();
  private area_list = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) { }





  // Setters
  setTitle(title: any): void {
    this.title.next(title);
  }

  setArea(area: string): void {
    this.set_area.next(area);
  }
  setAreaList(areaList:any): void {
    this.area_list.next(areaList);
  }




  // Getters
  getTitle(): Observable<any> {
    return this.title.asObservable();
  }

  getArea(): Observable<any> {
    return this.set_area.asObservable();
  }

  getAllAreas(): Observable<any> {
    return this.area_list.asObservable();
  }
}
