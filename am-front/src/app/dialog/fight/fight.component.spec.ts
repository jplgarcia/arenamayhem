import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightComponent } from './fight.component';

describe('FightComponent', () => {
  let component: FightComponent;
  let fixture: ComponentFixture<FightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
