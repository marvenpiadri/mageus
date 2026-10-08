import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
declare const PR: any;
import { QuillModule }      from 'ngx-quill'

import { ToastModule }                  from 'primeng/toast';
import { ConfirmDialogModule }          from 'primeng/confirmdialog';
import { TextFieldModule } from '@angular/cdk/text-field';   //import this module
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MatSlideToggleModule }         from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { DragDropModule }               from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ImageModule } from 'primeng/image';
import { ConfirmationService, MessageService } from 'primeng/api';
import Quill from 'quill';
const icons = Quill.import("ui/icons");
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-add_text',
    imports: [ToastModule, TextFieldModule, CommonModule, FormsModule, ButtonModule, QuillModule, DragDropModule, ImageModule, CommonModule, ConfirmDialogModule, InputTextModule, MatSlideToggleModule, TextareaModule],
    providers: [ConfirmationService, MessageService, DialogService],
    templateUrl: './add_text.component.html',
    styleUrls: ['./add_text.component.css']
})
export class Add_textComponent implements OnInit {

  articlePart:any = '';
  magazineID;
  article:any = '';

  
  postError     :boolean  = false;
  articleError  :boolean  = false;
  titleError    :boolean  = false;
  artError      :boolean  = false;
  imageError    :boolean  = false;

  constructor(public ref  : DynamicDialogRef,
    public domSanitizer   : DomSanitizer,
    public config         : DynamicDialogConfig) { 

      icons['bold']             = '<i class="fa-solid fa-bold"></i>';
      icons['underline']        = '<i class="fa-solid fa-underline"></i>';
      icons['link']             = '<i class="fa-solid fa-link"></i>';
      icons['video']            = '<i class="fa-solid fa-code"></i>';
      icons['code-block']       = '<i class="fa-solid fa-terminal"></i>';
      icons['blockquote']       = '<i class="fa-solid fa-quote-right"></i>';
      icons['list']['ordered']  = '<i class="fa-solid fa-list-ol"></i>';
      icons['list']['bullet']   = '<i class="fa-solid fa-list-ul"></i>';
      icons['image']            = '<i class="fa-solid fa-image"></i>';
      icons['italic']           = '<i class="fa-solid fa-italic"></i>';
      icons['indent']['+1']     = '<i class="fa-solid fa-indent"></i>';
      icons['indent']['-1']     = '<i class="fa-solid fa-indent fa-flip-horizontal"></i>';
      icons['strike']           = '<i class="fa-solid fa-text-slash"></i>';
      icons['align']['']        = '<i class="fa-solid fa-align-left"></i>';
      icons['align']['center']  = '<i class="fa-solid fa-align-center"></i>';
      icons['align']['right']   = '<i class="fa-solid fa-align-right"></i>';
      icons['align']['justify'] = '<i class="fa-solid fa-align-justify"></i>';


    this.magazineID = config.data.magazineID;
    if(config?.data?.articlePart?.changingThisBreaksApplicationSecurity){
      this.articlePart = config?.data?.articlePart?.changingThisBreaksApplicationSecurity;
      this.article = this.articlePart;
      console.log(this.article)
    }
  }

  ngOnInit() {
  }

  async onTextChanged(event){
    console.log(event)
  }

  add(){
    this.ref.close({type: 'text', content: this.article});
    console.log(this.article);
  }

  quillEditorRef: any;
  getEditorInstance(editorInstance: any) {
    this.quillEditorRef = editorInstance;
    const toolbar = editorInstance.getModule('toolbar');
    // toolbar.addHandler('image', this.imageHandler);
    // toolbar.addHandler('video', this.videoHandler);
  }

}

