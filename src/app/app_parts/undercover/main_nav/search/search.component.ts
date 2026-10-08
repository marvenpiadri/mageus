import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { GimiappService } from '../../../../../app/gimiapp.service';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { OverlayModule } from '@angular/cdk/overlay';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-search',
    imports: [CommonModule, 
      InputIconModule, 
      InputTextModule, 
      FloatLabelModule, 
      IconFieldModule, 
      RouterLink, MatSidenavModule, 
      OverlayModule, 
      InfiniteScrollDirective, 
      FormsModule, ReactiveFormsModule],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit, OnDestroy {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  searchField: FormControl;
  coolForm: FormGroup;

  notifs:any    = [];
  searches:any  = [];
  notifsOffset  = 0;
  notifScrollBol:boolean  = false;
  displaySearch:boolean   = false;
  isSearching:boolean     = false;
  searchObservable:any;

  constructor(
    public activeRoute: ActivatedRoute,
    public router: Router,
    private fb    : FormBuilder,
    public service: GimiappService) { 

      this.searchField = new FormControl();
      this.coolForm = this.fb.group({search: this.searchField});

      this.searchObservable = this.searchField.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchInput) => {
          console.log(searchInput)
          if(searchInput.length > 0){
            this.isSearching = true;
            return this.service.searchUsers(this.searchField.value)
          }else {
            this.isSearching = false;
            return []
          }
        }),
      ).subscribe((data)=>{
        console.log(data)
        if(data){
          this.searches = data;
        }
        this.isSearching = false;
      })
    }

  height = 0;
  width = 35;
  ngOnInit() {
    this.height = ((this.width / 9) * 16)
    this.notifsOffset = 0;    
    this.displayNotifs(this.notifsOffset);
    // this.service.markView().subscribe(data=>{});

  }

  ngOnDestroy(){
    this.searchObservable.unsubscribe();
  }

  displayNotifs(offset){
    this.service.getNotifs(offset).subscribe((data) => {
      for (let index = 0; index < data.length; index++) {
        this.notifs.findIndex((ds) => ds.notif_id === data[index].notif_id) === -1 && this.notifs.push(data[index]);
        if(index == (data.length-1)){
          this.notifScrollBol = false;
        }
      }
    })
  }

  onScrollDown(){
    this.notifsOffset += 15;
    this.displayNotifs(this.notifsOffset);
  }

  searchForUsers(): any{
    if(this.searchField.value.trim().length > 0){
      this.displaySearch = true;
    }else{
      this.displaySearch = false;
      this.searches = [];
    }
  }

}
