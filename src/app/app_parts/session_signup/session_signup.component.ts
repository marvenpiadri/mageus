import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GimiappService } from '../../gimiapp.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { NgFor, NgIf } from '@angular/common';
import { MatProgressSpinnerModule }     from '@angular/material/progress-spinner';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-session_signup',
    imports: [NgIf, InputTextModule, MatProgressSpinnerModule, PasswordModule, IconFieldModule, ToastModule, InputIconModule, ReactiveFormsModule],
    templateUrl: './session_signup.component.html',
    styleUrls: ['./session_signup.component.scss'],
    providers: [MessageService, GimiappService]
})
export class Session_signupComponent implements OnInit, OnDestroy {
  progCreate     : any = false;

  fullname       : any;
  username       : any;
  email          : any;
  passowrd       : any;
  login_pass     : any;
  login_inf      : any;
  decodedToken   : any;
  Token          : any;
  loader     = false;
  auth : any;
  user : any;
  loggedIn : any;
  coolForm;
  socialLogin:any;

  searchObservable:any;
  emailObservable:any;

  userForm: FormGroup;
  searchField: FormControl;
  isSearching = false;
  emailSearching = false;
  usernameExists = false;
  constructor(
    private service   : GimiappService,
    private router  : Router,
    private http  : HttpClient,
    private fb    : FormBuilder,
    private jwtHelper : JwtHelperService,
    private messageService: MessageService
  ) { 
 
    this.userForm = this.fb.group({
      fullname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
        Validators.pattern(/^(?!\.)([a-zA-Z0-9._-]+)(?<!\.)$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ])
    });
    

    this.searchObservable = this.userForm.controls.username.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((searchInput: any) => {
        let username = searchInput.trim().toLowerCase().replace(/\s/g,'');
    
        if(/^(?!\.)([a-zA-Z0-9._-]+)(?<!\.)$/.test(username)){
          this.userForm.get('username').setErrors({ characters: false });
          console.log(username);
          if(username.length > 0){
            this.isSearching = true;
            return this.service.checkUserName(username);
          } else {
            this.isSearching = false;
            return [];
          }
        } else {
          this.userForm.get('username').setErrors({ characters: true });
          this.messageService.add({ severity: 'error', summary: 'Wrong Characters', detail: 'Write valid characters', key: 'bl', life: 3000 });
          return [];
        }
      }),
    ).subscribe((data) => {
      console.log(data[0].exists);
      this.usernameExists = data[0].exists;
      this.userForm.get('username').setErrors({ exists: data[0].exists });
      if(data[0].exists){
        this.messageService.add({ severity: 'error', summary: 'Username', detail: 'This username is taken', key: 'bl', life: 3000 });
      }
      this.isSearching = false;
    });
    

    this.emailObservable = this.userForm.controls.email.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((searchInput:any) => {
        let email = searchInput.trim().toLowerCase().replace(/\s/g,'')

        if(/^[a-z0-9\_\.]+\@[a-z]+\.[a-z]+$/.test(email)){
          this.userForm.get('email').setErrors({ characters: false });
          console.log(email)
          if(email.length > 0){
            this.emailSearching = true;
            return this.service.checkUserEmail(email)
          }else {
            this.emailSearching = false;
            return []
          }
        }else{
          this.messageService.add({ severity: 'error', summary: 'Wrong Characters', detail: 'Invalid email address', key: 'bl', life: 3000 });
          return []
        }
      }),
    ).subscribe((data)=>{
      console.log(data[0].exists)
      data[0].exists && this.messageService.add({ severity: 'error', summary: 'Emai', detail: 'email address is already taken', key: 'bl', life: 3000 });

      if(data){
        // this.searches = data;
      }
      this.emailSearching = false;
    })
    
  }

  signOut(): void {
    // this.authService.signOut();
  }

  ngOnInit() {
    this.messageService.add({ severity: 'danger', summary: 'danger', detail: 'Message Content' });


  }

  ngOnDestroy() {
    this.searchObservable.unsubscribe();
    this.emailObservable.unsubscribe();
  }

  createMyAccount(){

    this.progCreate = true;
    let fullname = this.userForm.controls.fullname.value;
    let username = this.userForm.controls.username.value.trim().toLowerCase().replace(/\s/g,'')
    let email    = this.userForm.controls.email.value;
    let password = this.userForm.controls.password.value;

    if(fullname.length > 0 && username.length > 0 && email.length > 0 && password.length > 0 && this.loader == false){
      this.loader = false;
      this.service.createMyProfile(fullname, username, email, password).subscribe((data :any) =>{
        if(data){
          this.progCreate = false;
          this.loader = false;
          localStorage.setItem('token', data.token), 
          this.decodedToken = this.jwtHelper.decodeToken(localStorage.getItem('token'));
          localStorage.setItem('pic', this.decodedToken.pic)
          this.router.navigate(['/'+this.decodedToken.username])
        }          
      })
    }else{
      this.progCreate = false;
    }

  }

  signUpToggler(){
    this.router.navigate(['login']);
  }

}
