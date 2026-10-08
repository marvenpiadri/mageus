import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { GimiappService } from '../../../../app/gimiapp.service';
import { environment } from '../../../../environments/environment';
import { HttpEventType } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
    selector: 'app-add_image',
    imports: [FileUploadModule],
    templateUrl: './add_image.component.html',
    styleUrls: ['./add_image.component.css']
})

export class Add_imageComponent implements OnInit {
  API_URL = environment.API_URL;
  @ViewChild('fileuploader') primeFileUpload: FileUpload;
  embedValue:any = '';
  postID;
  file;

  constructor(
    public service        : GimiappService,
    public config         : DynamicDialogConfig,
    public messageService : MessageService,
    public ref            : DynamicDialogRef ) { 
    
      this.postID = config.data.postID;
  }

  ngOnInit() {
  }


  myUploader($event) {
    console.log($event)
    this.service.uploadFile($event.files[0]).subscribe((events:any) => {
      if(events.type == HttpEventType.UploadProgress){
        let perc:any = parseInt(((events.loaded/events.total)*100).toFixed(0));
        this.primeFileUpload.onProgress.emit(perc);
      }else if(events.type == HttpEventType.Response){
        console.log(events)

        this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: 'Upload was successful'});
        let perc:any = 0;
        this.primeFileUpload.onProgress.emit(perc);
        this.ref.close({type: 'image', content: events.body.imageUrl});
      }
    })
  }

  progressReport($event: any) {
    this.primeFileUpload.progress = $event;
  }

}
