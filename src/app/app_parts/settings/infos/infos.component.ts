import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GimiappService } from '../../../../app/gimiapp.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-infos',
    imports: [CommonModule, FormsModule, MatRadioModule, MatDatepickerModule],
    templateUrl: './infos.component.html',
    styleUrls: ['./infos.component.css']
})
export class InfosComponent implements OnInit {
  err  = 0;
  succ = 2;
  fullname;
  username;
  email;
  gander;
  birth = new Date();
  picker;
  setPass:any;

  odlPass:string = '';
  newpass:string = '';
  repeatPass:string = '';
  
  usernameError = {
    ref : 0,
    msg : ''
  }

  oldPasswordErr = {
    ref : 0,
    msg : ''
  }

  useremailError = {
    ref : 0,
    msg : ''
  }
  
  infosData: any;
  showPass = false;

  constructor(public service: GimiappService) { }

  ngOnInit(): void {
    this.service.getInfos().subscribe((data)=>{
      if(data.body){
        this.infosData = data.body[0];
        this.gander = data.body[0].gander;
      }
    })
  }

  
  change_fullname(){
    let data = this.fullname.trim();
    if(data.length > 0){
      this.service.changeFullName(data).subscribe((data)=>{
        if(data.body)
          this.infosData.name = this.fullname;
          this.fullname = "";
      })
    }
  }

  change_date(event){
    let date = event.value;
    this.service.changeDate(date).subscribe((data)=>{
      if(data.body)
        this.infosData.birthday = new Date(date);
    })
  }

  changeGander(ref){
    this.infosData.gander = ref;
    this.service.change_gander(ref).subscribe((data)=>{
      if(data.body){
    
      }
    })
  }
  
  checkUsername(){
    let userName = this.username.trim().toLowerCase().replace(/\s/g,'')
    this.usernameError.ref = 0;
    this.usernameError.msg = '';
    if(userName.length > 0){
      if(/^[a-z0-9\_\.]*$/.test(userName)){
        this.service.checkUserName(userName).subscribe((data)=>{
          data.body[0].ref == 1 && (this.usernameError.ref = 1, this.usernameError.msg = 'Already Taken')
          data.body[0].ref == 2 && (this.usernameError.ref = 2, this.usernameError.msg = 'Valid')

        })
      }else {
        this.usernameError.ref = 1;
        this.usernameError.msg = 'invalid characters';
      }
    }
  }  
  
  changeUserName(){
    let userName = this.username.trim().toLowerCase().replace(/\s/g,'')
    if(this.usernameError.ref = 2){
      this.service.username_change(userName).subscribe(data=>{
        data.body[0].ref == 1 && (this.usernameError.ref = 1, this.usernameError.msg = 'Already Taken')
        data.body[0].ref == 2 && (this.usernameError.ref = 0, this.usernameError.msg = '', this.infosData.username = userName, this.username='',
        localStorage.setItem('token', data.body[0].token))
      })
    }
  }

  checkUserEmail(){
    let email = this.email.trim().toLowerCase().replace(/\s/g,'')
    this.useremailError.ref = 0;
    this.useremailError.msg = '';
    if(email.length > 0){
      if(/^[a-z0-9\_\.]+\@[a-z]+\.[a-z]+$/.test(email)){
        this.service.checkUserEmail(email).subscribe((data)=>{
          data.body[0].ref == 1 && (this.useremailError.ref = 1, this.useremailError.msg = 'Already Taken')
          data.body[0].ref == 2 && (this.useremailError.ref = 2, this.useremailError.msg = 'Valid')
        })
      }
    }
  }  

  sendEmail(){
    let email = this.email.trim().toLowerCase().replace(/\s/g,'')
    if(email.length > 0){
      if(/^[a-z0-9\_\.]+\@[a-z]+\.[a-z]+$/.test(email)){
        this.service.changeEmail(email).subscribe(data=>{
          data.body[0].ref == 1 && (this.useremailError.ref = 1, this.useremailError.msg = 'Already Taken')
          data.body[0].ref == 2 && (this.useremailError.ref = 0, this.useremailError.msg = '', this.infosData.email = email, this.email='')
        })
      }else {
        this.useremailError.ref = 1;
        this.useremailError.msg = 'invalid characters';
      }
    }
  }

  checkSetPassword(){
    this.oldPasswordErr.ref = 0;
    this.oldPasswordErr.msg = '';
    let pass = this.setPass.trim().replace(/\s/g,'');
    this.setPass = pass;

    var strongRegex = new RegExp("^(?=.*[a-zA-Z0-9_@.$#])(?=.{8,})");

    
    if(pass.length > 7){
      if(strongRegex.test(pass)){
        this.oldPasswordErr.ref = 2; this.oldPasswordErr.msg = 'Valid';
      }else{
        this.oldPasswordErr.ref = 1; this.oldPasswordErr.msg = "Invalid Input";
      }
    }else if(pass.length > 0){
      this.oldPasswordErr.ref = 1; this.oldPasswordErr.msg = "Too short";
    }else{
      this.oldPasswordErr.msg = "";
    }
  }


  checkPassword(){
    this.oldPasswordErr.ref = 0;
    this.oldPasswordErr.msg = '';
    let pass = this.setPass.trim().replace(/\s/g,'');

    var strongRegex = new RegExp("^(?=.*[a-zA-Z0-9_@.$#])(?=.{8,})");
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    
    if(pass.length > 7){
      if(strongRegex.test(pass)){
        this.oldPasswordErr.ref = 2; this.oldPasswordErr.msg = 'Valid';
      }else{
        this.oldPasswordErr.ref = 1; this.oldPasswordErr.msg = "Invalid Input";
      }
    }else if(pass.length > 0){
      this.oldPasswordErr.ref = 1; this.oldPasswordErr.msg = "Too short";
    }else{
      this.oldPasswordErr.msg = "";
    }
  }

  setPassword(){

  }

  changePassword(ref){
    if(ref == 1){
      if(this.odlPass.length > 0){
        if(this.newpass == this.repeatPass){
          this.service.passChange(this.odlPass, this.newpass).subscribe((data) => { 
            data.body[0].ref == 1 && (this.oldPasswordErr.ref = 1, this.oldPasswordErr.msg = "Doesn't match")
            data.body[0].ref == 2 && (this.oldPasswordErr.ref = 2, 
              this.oldPasswordErr.msg = 'Password Changed', this.odlPass = '', this.newpass = '', this.repeatPass = '')
          })
        }else {
          this.oldPasswordErr.ref = 1; this.oldPasswordErr.msg = "Passwords don't match eachothers";
        }
      }
    }else if(ref == 2){
      this.service.setPassword(this.setPass).subscribe((data:any) => {
        console.log(data)
        data[0].ref == 2 && (this.oldPasswordErr.ref = 2, 
          this.oldPasswordErr.msg = 'Password Changed', 
          this.setPass = '',
          this.infosData.password = data[0].pass)
      })
    }
    
  }
  
  switchEye(){
    this.showPass == true ? (this.showPass = false) : (this.showPass = true);
  }
}