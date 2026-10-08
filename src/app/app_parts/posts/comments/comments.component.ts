import { ConnectionPositionPair, OverlayModule } from '@angular/cdk/overlay';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { GimiappService } from '../../../../app/gimiapp.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-comments',
    imports: [CommonModule, InfiniteScrollDirective, OverlayModule, RouterLink, FormsModule, TextFieldModule],
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css']
})

export class CommentsComponent implements OnInit, OnDestroy {
  API_URL = environment.API_URL;
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  @Input() data: any;

  comments:Array<any> = [];
  comment:string = '';
  token     : any;
  userOwner : any;
  postOwnerID;
  showMoreComments_sub : any;
  article_sub: any;
  iUsername;

  positions: ConnectionPositionPair[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 10
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -10
    },
  ];

  constructor(
    public jwtHelper       : JwtHelperService,
    public service         : GimiappService, 
    public activatedRoute  : ActivatedRoute,
    public router          : Router) {
      this.token     = localStorage.getItem('token');
      this.userOwner = this.token ? this.jwtHelper.decodeToken(this.token) : null; 
      this.iUsername = this.token ? this.jwtHelper.decodeToken(this.token).username : null; 

      this.router.events.forEach((event) => {
        if(event instanceof NavigationEnd){
       
        } 
      })

    }

  ngOnInit() {
    this.getComments();
    
    this.showMoreComments_sub = this.service.showMoreComments_Obs.subscribe((data:any) => {
      this.showMoreComments();
    })

  }

  ngOnDestroy() {
    this.showMoreComments_sub.unsubscribe();
  }

  getComments(){
    this.service.postGetComments(this.data.article_id).subscribe((data:any) => {
      if(data.length > 0){
        for (let v = 0; v < data.length; v++) { 
          let comment = data[v];
          comment.options = false;
          this.comments.push(comment)
        }      
      }
    })

  }

  showMoreComments(){
    if(this.comments.length > 9){
      let lastID = this.comments[this.comments.length-1].comment_id;
      if(lastID){
        this.service.postGetCommentsScroll(this.data.article_id, lastID).subscribe((data:any) => {
          if(data){
            for (let v = 0; v < data.length; v++) { 
              let comment = data[v];
              comment.options = false;
              this.comments.push(comment)
            }
          }
        })
      }
    }
  }
  
  edit_post(ind){
    this.comments[ind].edit = this.comments[ind].comment;
    this.comments[ind].options = false;
  }

  edit_sub_comment(ind, ind_2){
    this.comments[ind].answers[ind_2].edit = this.comments[ind].answers[ind_2].comment;
    this.comments[ind].answers[ind_2].options = false;
  }

  delete_post(i){
    if(confirm('Are you sure you want to delete this comment ?')){
      this.service.postDeleteComment(this.comments[i].comment_id).subscribe((data:any)=>{
        this.comments.splice(i, 1);
      })
    }
  }

  delete_sub_post(ind, ind_2){
    if(confirm('Are you sure you want to delete this comment ?')){
      this.service.postDeleteComment(this.comments[ind].answers[ind_2].comment_id).subscribe((data:any)=>{
        this.comments[ind].answers.splice(ind_2, 1);
      })
    }
  }

  getAvgMag(stars, voters){
    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }

  // 5 stars rating
  commentRate(comment_id, ind){
    this.service.commentRate(comment_id, this.data.article_id, this.comments[ind].user_id).subscribe((data:any) => {
      if(data == 'upsert')
        this.comments[ind].istars = 1,
        this.comments[ind].voters += 1;
      else
        this.comments[ind].istars = 0,
        this.comments[ind].voters -= 1;

    })
  }

  answerRate(comment_id, ind, ind_2){
    this.service.commentRate(comment_id, this.data.article_id, this.comments[ind].answers[ind_2].user_id).subscribe((data:any) => {
      if(data == 'upsert')
        this.comments[ind].answers[ind_2].istars = 1,
        this.comments[ind].answers[ind_2].voters += 1;

      else
        this.comments[ind].answers[ind_2].istars = 0,
        this.comments[ind].answers[ind_2].voters -= 1;

    })
  }

  postComment(ref, event){
    if(ref == 1){
      if (event.keyCode == 13 && !event.shiftKey)
      this.sendPostComment();
    }else {
      this.sendPostComment();
    }
  }

  sendPostComment(){
    if(this.comment.trim().length > 0){
      this.service.postSendComment(this.data.article_id, this.userOwner.userID, this.comment.trim())
        .subscribe((comment:any) => { 
          comment.answers = [];
          this.comments.unshift(comment);  // not data[0]
        });
      this.comment = '';
    }
  }
  

  commentReply(event, ind){
    console.log(this.comments[ind].reply)
    if(this.comments[ind].reply.trim().length > 0)
      this.sendCommentReply(ind);
  }

  sendCommentReply(ind){
    this.service.sendCommentReply(
      this.comments[ind].comment_id,
      this.comments[ind].user_id,
      this.data.article_id,
      this.comments[ind].reply
    ).subscribe((reply:any) => { 
      this.comments[ind].answers.push(reply); // not data[0]
      this.comments[ind].reply = '';
    });
  }
  
  commentEdit(ref, event, ind){
    if(this.comments[ind].edit.trim() != this.comments[ind].comment.trim()){
      if(this.comments[ind].edit.trim().length > 0)
        if(ref == 1){
          if (event.keyCode == 13 && !event.shiftKey)
          this.sendCommentEdit(ind);
        }else {
          this.sendCommentEdit(ind);
        }
    }
  }

  sendCommentEdit(ind){
    this.service.sendCommentEdit(this.comments[ind].comment_id, this.comments[ind].user_id, this.data.article_id, this.comments[ind].edit).subscribe(data => { 
      this.comments[ind].comment = this.comments[ind].edit;
      this.comments[ind].edit = '';
    })
  }

  replyEdit(ref, event, ind, ind_2){
    if(this.comments[ind].answers[ind_2].comment.trim() != this.comments[ind].answers[ind_2].edit.trim()){
      if(this.comments[ind].answers[ind_2].edit.trim().length > 0)
        this.sendReplyEdit(ind, ind_2);
    }
  }

  sendReplyEdit(ind, ind_2){
    let edit        = this.comments[ind].answers[ind_2].edit;
    let comment_id  = this.comments[ind].answers[ind_2].comment_id;
    let user_id     = this.comments[ind].answers[ind_2].user_id;

    this.service.sendCommentEdit(comment_id, user_id, this.data.article_id, edit).subscribe(data => { 
      this.comments[ind].answers[ind_2].comment = edit;
      this.comments[ind].answers[ind_2].edit = '';
    })
  }

  showMoreReplies(ind, comment_id, postID, ownerid){
    let commentID   = this.comments[ind].comment_id;
    let lastID      = this.comments[ind].answers[0].comment_id;
    this.service.getMoreCommentReplies(commentID, lastID, this.data.article_id).subscribe((data:any)=>{
      for (let i = 0; i < data.length; i++) {
        this.comments[ind].answers.unshift(data[i])
      }
    })
    this.comments[ind].replies -= 5

  }

  displayEditCont(ind){
    this.comments[ind].options ? this.comments[ind].options = false : this.comments[ind].options = true;
    console.log(this.comments[ind].options)
  }

  displaySubEditCont(ind, ind_2){
    this.comments[ind].answers[ind_2].options ? this.comments[ind].answers[ind_2].options = false : this.comments[ind].answers[ind_2].options = true;
  }

}
