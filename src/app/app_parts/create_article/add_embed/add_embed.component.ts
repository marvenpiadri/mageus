import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GimiappService } from '../../../../app/gimiapp.service';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add_embed',
    imports: [FileUploadModule, CommonModule, FormsModule],
    templateUrl: './add_embed.component.html',
    styleUrls: ['./add_embed.component.css']
})
 
export class Add_embedComponent implements OnInit {
  embedValue:any = '';
  magazineID;

  constructor(
    public service             : GimiappService,
    public config              : DynamicDialogConfig,
    public ref                 : DynamicDialogRef ) { 
      this.magazineID = config.data.magazineID;
  }

  ngOnInit() {
  }

  add(){
    this.ref.close({type: 'embed', content: this.embedValue});
  }

}
