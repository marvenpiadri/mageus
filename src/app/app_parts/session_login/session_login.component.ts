import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtModule, JwtHelperService } from "@auth0/angular-jwt";
import { MessageService } from 'primeng/api';
import { GimiappService } from '../../gimiapp.service';
import { NgFor, NgIf } from '@angular/common';
import { MatProgressSpinnerModule }     from '@angular/material/progress-spinner';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-session_login',
    imports: [NgIf, InputTextModule, MatProgressSpinnerModule, PasswordModule, IconFieldModule, ToastModule, InputIconModule, ReactiveFormsModule],
    templateUrl: './session_login.component.html',
    styleUrls: ['./session_login.component.scss'],
    providers: [MessageService, GimiappService]

})
export class Session_loginComponent implements OnInit {

  profile : any = {};
  pageRef : any = 2;

  loader     = false;
  progLog    = false;


  nameError      : any = { ref : 0 }
  usernameError  : any = { ref : 0 }
  useremailError : any = { ref : 0 }
  passwordError  : any = { ref : 0 }
  logErr         : any = { ref : 0 }

  fullname       : any;
  username       : any;
  email          : any;
  passowrd       : any;
  login_pass     : any = '';
  login_inf      : any = '';
  decodedToken   : any;
  Token          : any;
  jwtHelper      : any;

  userForm: FormGroup;

  constructor(private dat   : GimiappService, 
              private Rout  : Router, 
              private fb    : FormBuilder,
              private messageService: MessageService,
              private jwt   : JwtHelperService) {
    this.Token     = localStorage.getItem('token');
    this.decodedToken = this.Token ? this.jwtHelper.decodeToken(this.Token) : null; 
            
    this.userForm = this.fb.group({
      warning: new FormControl('', [   ]),
      username: new FormControl('', [
        Validators.required,
        Validators.max(60),
        Validators.min(3)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.max(50),
        Validators.min(3)
      ]),
    });
  }
    
  ngOnInit() {    
    
    this.fullname = "";
    this.username = ''
    // if (this.Token) {
    //   this.Rout.navigate(['user/'+this.Token.userID]);
    // }else{
    //   this.Rout.navigate(['portal']);
    // }
  }

  log_user(){
    this.progLog = true;
    let username = this.userForm.controls.username.value;
    let password = this.userForm.controls.password.value;

    if(username.length > 0 && password.length > 0){
      this.dat.getDataLog(username, password).subscribe(
        (data:any) => {
          if(data){

            data.err == 1 && (this.logErr.ref = 1, 
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Account', key: 'bl', life: 3000 }))
            data.err == 2 && (this.logErr.ref = 1, 
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Wrong Password', key: 'bl', life: 3000 }))
            data.err == 0 && (this.logErr.ref = 0,
                                  localStorage.setItem('token', data.token), 
                                  this.decodedToken = this.jwt.decodeToken(localStorage.getItem('token')),
                                  localStorage.setItem('pic', this.decodedToken.pic),
                                  this.Rout.navigate(['/'+this.decodedToken.username])
                                )
          }
        },
        (error:any) => console.log(error.error.text)
      );
    }else{
    } 
  }
  
  
  loginToggler(){
    this.Rout.navigate(['create']);
  }
  



}
