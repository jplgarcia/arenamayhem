import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherComponent } from './voucher.component';

describe('VoucherComponent', () => {
  let component: VoucherComponent;
  let fixture: ComponentFixture<VoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
