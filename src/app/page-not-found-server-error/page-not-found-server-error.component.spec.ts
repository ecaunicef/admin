import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFoundServerErrorComponent } from './page-not-found-server-error.component';

describe('PageNotFoundServerErrorComponent', () => {
  let component: PageNotFoundServerErrorComponent;
  let fixture: ComponentFixture<PageNotFoundServerErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageNotFoundServerErrorComponent]
    });
    fixture = TestBed.createComponent(PageNotFoundServerErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
