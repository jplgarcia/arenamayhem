import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawVoucherComponent } from './withdraw.voucher.component';

describe('WithdrawVoucherComponent', () => {
  let component: WithdrawVoucherComponent;
  let fixture: ComponentFixture<WithdrawVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawVoucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WithdrawVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
