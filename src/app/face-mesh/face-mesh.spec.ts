import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceMesh } from './face-mesh';

describe('FaceMesh', () => {
  let component: FaceMesh;
  let fixture: ComponentFixture<FaceMesh>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceMesh]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceMesh);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
