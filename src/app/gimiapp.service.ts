import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import * as io from 'socket.io-client';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NGX_LOADING_BAR_IGNORED } from '@ngx-loading-bar/http-client';

@Injectable({
  providedIn: 'root',
})

export class GimiappService {
  API_URL = environment.API_URL;
  tokenUserID:any;

  // Reactive state for glass mode
  glassModeSubject = new BehaviorSubject<boolean>(false);
  glassMode$ = this.glassModeSubject.asObservable();
  
  isGlassMode:boolean = false;

  feedScroll:any = 0;
  profScroll:any = 0;

  socket:any;

  constructor(
    public http: HttpClient,
    public jwt: JwtHelperService) {
      this.tokenUserID = this.jwt.decodeToken(localStorage.getItem('token'))
      console.log(this.API_URL)
    this.socket = io.connect(this.API_URL);

    // this.socket.on('connection', function(){
    //   console.log('sss')
    // });
    this.socket.on('connection', function(){
      console.log('sss')
    });
    // this.socket.emit("question", (answer) => {
    //   console.log(answer)
    //   // ...
    // });
    // this.socket.on('test', (ms)=>{    
    //   console.log('msmsms')   
    //   // this.getMsg.next(ms);
    // })
    this.socket.on('getMessageBack', (ms)=>{   
      this.getMsg.next(ms);
    })
    // this.socket.on('viewMessageBack', (ms)=>{
    //   this.viewMsg.next(ms);
    // })


   }

  getGeoData() {
    return this.http.get(this.API_URL+'/api/ipinfo');
  }

  showMoreComments:any = new Subject();
  showMoreComments_Obs = this.showMoreComments.asObservable();

  profilScrollPos:any = new BehaviorSubject('');
  profilScrollPosObs = this.profilScrollPos;

  socialLogin:any = new BehaviorSubject('');
  socialLoginObs  = this.socialLogin.asObservable(); 

  NewPosts:any = new BehaviorSubject('');
  posts = this.NewPosts.asObservable();

  sendMsgBack:any = new Subject();
  sendMsgBackObs  = this.sendMsgBack.asObservable();

  chat_dLim:any = new Subject();
  chat_dLimObs  = this.chat_dLim.asObservable();

  showMoreDeck:any  = new Subject();
  showMoreDeck_obs  = this.showMoreDeck.asObservable();
  
  deckDeleteDay:any  = new Subject();
  deckDeleteDay_obs  = this.deckDeleteDay.asObservable();


  diaryProgBar:any = new Subject();
  diaryProgBarObs  = this.diaryProgBar.asObservable();

  getMoreMagz:any = new Subject();
  getMoreMagzObs  = this.getMoreMagz.asObservable();
  
  send_pic:any    = new Subject();
  send_picObs:any = this.send_pic.asObservable();

  quizesBox:any    = new Subject();
  quizesBoxObs:any = this.quizesBox.asObservable();

  getMsg:any = new Subject();
  getMsgObs  = this.getMsg.asObservable();

  viewMsg:any = new Subject();
  viewMsgObs  = this.viewMsg.asObservable();

  msgGhost:any = new Subject();
  msgGhostObs  = this.msgGhost.asObservable();

  msgReadGhost:any = new Subject();
  msgReadGhostObs  = this.msgReadGhost.asObservable();

  articleMagView:any = new BehaviorSubject('');
  articleMagViewObs  = this.articleMagView.asObservable();

  articleDel:any = new BehaviorSubject('');
  articleDelObs  = this.articleDel.asObservable();

  getDataLog(userInf:string, userpassword:string):any{

    let params = new HttpParams();
    params = params.set('user_cred', userInf);
    params = params.set('password', userpassword);
    let url = this.API_URL+"/token/loguser";
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    });
  }

  createMyProfile(fullname:any, username:any, email:any, password:any) :any{
    let url           = this.API_URL+'/create/account';
    
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('username', username);
    params      = params.set('email', email);
    params      = params.set('fullname', fullname);
    params      = params.set('password', password);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  socialSign(socialData) :any{
    
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/json');
    let params        = new HttpParams();
    let url           = this.API_URL+'/social/signup';
    
    return this.http.post(url, socialData, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  GetCovers(userID:any) :any{

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/profile/cover';
    params = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })

  }

  postEdit:any = new BehaviorSubject<any[]>([]);
  postEditObs  = this.postEdit.asObservable();

  postEditCancel:any = new Subject();
  postEditCancelObs  = this.postEditCancel.asObservable();

  pageScroll:any = new BehaviorSubject([]);
  pageScrollObs  = this.pageScroll.asObservable();

  getMiniStories:any = new BehaviorSubject<any[]>([]);
  getMiniStoriesObs  = this.getMiniStories.asObservable();

  feedsMiniStories:any = new BehaviorSubject<any[]>([]);
  feedsMiniStoriesObs  = this.feedsMiniStories.asObservable();

  magMiniStories:any = new BehaviorSubject<any[]>([]);
  magMiniStoriesObs  = this.magMiniStories.asObservable();

  notifMiniStories:any = new BehaviorSubject<any[]>([]);
  notifMiniStoriesObs  = this.notifMiniStories.asObservable();

  getUserPosts_sub(userID:any, path_ref:any, postID:any) :any{
    console.log(path_ref)
    console.log(this.getMiniStories.getValue())
    if(path_ref == ':userID'){
      this.getUserPosts(userID, path_ref, postID).subscribe((data:any)=>{
        if(data.length > 0){
          if(this.getMiniStories.getValue()[0]){
            this.getMiniStories.next(this.getMiniStories.getValue().concat(data)); 
          }else{
            this.getMiniStories.next(data); 
          }
        }else{
          if(!this.getMiniStories.getValue()[0]){
            this.getMiniStories.next([{empty: true}])
          }
        }
      })
    }else if(path_ref == 'feeds'){
      this.getFeedsPosts(userID, path_ref, postID).subscribe((data:any)=>{
        if(data.length > 0){
          if(this.feedsMiniStories.getValue()[0]){
            this.feedsMiniStories.next(this.feedsMiniStories.getValue().concat(data)); 
          }else{
            this.feedsMiniStories.next(data); 
          }
        }else{
          if(!this.feedsMiniStories.getValue()[0]){
            this.feedsMiniStories.next([{empty: true}])
          }
        }
      })
    }else if(path_ref == ':articleID'){
      this.getPostByPostID(path_ref, postID).subscribe((data:any)=>{
        console.log(data)
        if(data.length > 0){
          if(this.notifMiniStories.getValue()[0]){
            this.notifMiniStories.next(this.notifMiniStories.getValue().concat(data)); 
          }else{
            this.notifMiniStories.next(data); 
          }
        }else{
          if(!this.notifMiniStories.getValue()[0]){
            this.notifMiniStories.next([{empty: true}])
          }
        }
      })
    }
   
  }

  getUserPosts(userID:any, path_ref:any, postID:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/articles';
    params = params.set('userID', userID);
    params = params.set('path_ref', path_ref);
    params = params.set('postID', postID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  
  } 

  getFeedsPosts(userID:any, path_ref:any, postID:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/posts/feeds';
    params = params.set('userID', userID);
    params = params.set('path_ref', path_ref);
    params = params.set('postID', postID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  
  } 

  getPostByPostID(path_ref:any, articleID:any) :any{
    console.log(path_ref, articleID);

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/articles/:articleID';
    params = params.set('articleID', articleID);
    params = params.set('path_ref', path_ref);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
 
  } 

  getUserMorePosts_sub(userID:any, path_ref:any, postID:any) :any{

    if(path_ref == ':userID'){
      this.getUserMorePosts(userID, path_ref, postID).subscribe((data:any)=>{
        if(data.length > 0){
          this.getMiniStories.next(this.getMiniStories.getValue().concat(data)); 
        }else{
          this.getMiniStories.next(data); 
        }
      })
      
    }else if(path_ref == 'feeds'){
      this.getFeedsMorePosts(userID, path_ref, postID).subscribe((data:any)=>{
        if(data.length > 0){
          if(this.feedsMiniStories.getValue()[0]){
            this.feedsMiniStories.next(this.feedsMiniStories.getValue().concat(data)); 
          }else{
            this.feedsMiniStories.next(data); 
          }
        }else{
          this.feedsMiniStories.next(data); 
        }
      })
    }
   
  }

  getUserMorePosts(userID:any, path_ref:any, lastID:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/articles/more';
    params = params.set('userID', userID);
    params = params.set('path_ref', path_ref);
    params = params.set('lastID', lastID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  } 
  
  getFeedsMorePosts(userID:any, path_ref:any, postID:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/posts/feeds/more';
    params = params.set('userID', userID);
    params = params.set('path_ref', path_ref);
    params = params.set('postID', postID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }
  
  // Magazine posts
  getUserPostsMag(path_ref:any, magID:any) :any{
    console.log(path_ref, magID);

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/posts/magazine';
    params = params.set('path_ref', path_ref);
    params = params.set('magID', magID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
 
  } 
  
  getMagazineMorePosts_sub(path_ref:any, postID:any, mag_id:any) :any{

    this.getMagazineMorePosts(path_ref, postID, mag_id).subscribe((data:any)=>{
      if(data.length > 0){
        this.magMiniStories.next(this.magMiniStories.getValue().concat(data)); 
      }else{
        this.magMiniStories.next(data); 
      }
    })
   
  }

  getMagazineMorePosts(path_ref:any, postID:any, magID:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/posts/magazine/more';
    params = params.set('path_ref', path_ref);
    params = params.set('postID', postID);
    params = params.set('magID', magID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  change_rate(vote :any, articleID :any, userID :any){
    console.log(vote, articleID, userID)
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/article/vote';

    params = params.set('vote', vote);
    params = params.set('articleID', articleID);
    params = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions

    })
  }

  profHeader(userID :any) :any {
    let profHeader :any = this.API_URL+"/profile/profHeader";

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('userID', userID);
    
    return this.http.post(profHeader, params, {
      observe: 'response',
      responseType: 'json',
      headers: headerOptions
    });
  }
  
  unfollow(userID){
    let url    = this.API_URL+'/profile/unfollow';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('userID', userID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  follow(userID){
    let url    = this.API_URL+'/profile/follow';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('userID', userID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  profileHeader(username:string){

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/profile/header';
    params            = params.set('username', username);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })

  }

  sendQuiz(quiz, phantomAsk, userID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/quiz/send';
    params            = params.set('quiz', quiz);
    params            = params.set('phantomAsk', phantomAsk);
    params            = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })
  }

  resetData_Upload:any = new Subject();
  resetData_UploadObs  = this.resetData_Upload.asObservable();

  getGossipsProfile(userID:any) :any{
    let url    = this.API_URL+'/user/gossips';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('userID', userID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  yearViews(path, userID, year){
    let url    = this.API_URL+'/daysgone/views';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('path', path);
    params     = params.set('userID', userID);
    params     = params.set('year', year);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getUserOnePost(postID:any) :any{
    let url    = this.API_URL+'/edit/post/get';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('postID', postID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  rollDice(diary_id, ownerID, dice_1, dice_2){
    let url    = this.API_URL+'/diary/rolldice';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('diary_id', diary_id);
    params     = params.set('ownerID', ownerID);
    params     = params.set('dice_1', dice_1);
    params     = params.set('dice_2', dice_2);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  cardFlipView(diaryID, userID){
    let url    = this.API_URL+'/diary/view';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('diaryID', diaryID);
    params     = params.set('userID', userID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)      
    })
  }

  getMoreCommentReplies(commentID, lastID, articleID){
    let url    = this.API_URL+'/comment/replies/getmore';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('commentID', commentID);
    params     = params.set('lastID', lastID);
    params     = params.set('articleID', articleID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  delete_diary(diaryID){
    let url    = this.API_URL+'/diary/delete';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('diaryID', diaryID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }


  rateMag(article_id, ownerID, stars){
    let url    = this.API_URL+'/article/rate';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('article_id', article_id);
    params     = params.set('ownerID', ownerID);
    params     = params.set('stars', stars);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }
  
  rateMagAnswers(magazineID, answerID, ownerID, stars){
    let url    = this.API_URL+'/magazine/answer/rate';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('magazineID', magazineID);
    params     = params.set('answerID', answerID);
    params     = params.set('ownerID', ownerID);
    params     = params.set('stars', stars);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getMagazineIntro(magID :any) :any {
    let profHeader :any = this.API_URL+"/magazine/intro";

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('magID', magID);
    
    return this.http.post(profHeader, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    });
  }

  getMagazineArticles(magID :any) :any {
    let profHeader :any = this.API_URL+"/magazine/articles";

    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('magID', magID);
    
    return this.http.post(profHeader, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    });
  }
  
  readNotif(id, type_id):any{
    let url    = this.API_URL+'/read/notifs';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();

    params = params.set('id', id);
    params = params.set('type_id', type_id);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getNotifs(offset):any{
    let url     = this.API_URL+"/user/getNotifs";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('offset', offset);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    });
  }

  markView():any{
    let url     = this.API_URL+"/notif/view";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('mark', 'mark');

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    });
  }
  
  getInfos():any{
    let url     = this.API_URL+"/settings/info";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  checkUserName(username):any{
    console.log(username)
    let url     = this.API_URL+"/username/check";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('username', username);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  change_gander(ref):any{
    let url     = this.API_URL+"/settings/change_gander";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('ref', ref);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }
  
  changeDate(date):any{
    let url     = this.API_URL+"/settings/change_date";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('date', date);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  username_change(username):any{
    let url     = this.API_URL+"/username/change";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('username', username);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  changeFullName(data):any{
    let url     = this.API_URL+"/settings/change_fullname";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('data', data);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  // Settings Services
  checkUserEmail(email):any{
    let url     = this.API_URL+"/email/check";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('email', email);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }
  
  changeEmail(email):any{
    let url     = this.API_URL+"/settings/emailChange";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('email', email);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    })
  }

  passChange(password, newPass):any{
    let url     = this.API_URL+"/settings/passwordChange";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('password', password);
    params      = params.set('newPass', newPass);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    })
  }

  // wallpapers

  getPics():any{
    let url     = this.API_URL+"/settings/wallpapers";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  wallpaperChange(file:File, ref):any{
    let url       =  this.API_URL+'/settings/uploadPics';
    var form_data = new FormData();
    form_data.append('file', file);
    form_data.append('ref', ref);

    return this.http.post(url, form_data, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true
    });
  }

  deleteProf_pic(ref){
    let url     = this.API_URL+"/settings/deleteWallpaper";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('ref', ref);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  uploadFile(file:File):any{
    let url       =  this.API_URL+'/image/upload';
    let params    = new FormData();

    params.append('file', file);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)

    });
  }
  
  checkUserExist(userID){
    let url     = this.API_URL+"/user/exists";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  setPassword(password){
    let url     = this.API_URL+"/user/setPassword";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('password', password);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  countNotifs():any {
    let url    = this.API_URL+'/notifs/count';
    let header = new HttpHeaders()
    .set('content-type', 'application/x-www-form-urlencoded')
  
    let params = new HttpParams();

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)

    })
  }

  getFollowers(offset):any{
    let url     = this.API_URL+"/notifs/followers";
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('offset', offset);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: header
    });
  }

  postGetComments(articleID) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/article/comments';
    params            = params.set('articleID', articleID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  postGetCommentsScroll(articleID, lastID) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/article/comments/scroll';
    params            = params.set('articleID', articleID);
    params            = params.set('lastID', lastID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  postSendComment(articleID, ownerID, comment){
    let url    = this.API_URL+'/send/comment';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('articleID', articleID);
    params     = params.set('comment', comment);
    params     = params.set('ownerID', ownerID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  postDeleteComment(commentID){
    let url    = this.API_URL+'/post/delete/comment';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('commentID', commentID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  commentRate(comment_id, articleID, ownerID){
    let url    = this.API_URL+'/send/comment/rate';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('articleID', articleID);
    params     = params.set('ownerID', ownerID);
    params     = params.set('comment_id', comment_id);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }


  sendCommentReply(comment_id, ownerID, articleID, reply){
    let url    = this.API_URL+'/send/comment/reply';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('comment_id', comment_id);
    params     = params.set('ownerID', ownerID);
    params     = params.set('articleID', articleID);
    params     = params.set('reply', reply);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }
  
  sendCommentEdit(comment_id, ownerID, articleID, edit){
    let url    = this.API_URL+'/send/comment/edit';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('comment_id', comment_id);
    params     = params.set('ownerID', ownerID);
    params     = params.set('articleID', articleID);
    params     = params.set('edit', edit);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }
 
  getArticle(artID):any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/article/get';
    params            = params.set('artID', artID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  getEditArticle(postID):any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/article/edit/get';
    params            = params.set('postID', postID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  uploadImage(file:File, userID){
    let url    = this.API_URL+'/chatbox/uploadImage';
    var form_data = new FormData();
    form_data.append('file', file);
    form_data.append('userID', userID);

    return this.http.post(url, form_data, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true
    });
  }

  getArtics(username:any){
    let url    = this.API_URL+'/user/articles';
    let params = new HttpParams();
    let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params     = params.set('username', username);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  getArticsScroll(username:any, lastIndex:any){
    let url    = this.API_URL+'/user/articles/scroll';
    let params = new HttpParams();
    let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params     = params.set('username', username);
    params     = params.set('lastIndex', lastIndex);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  getArticsMagazine(magID:any){
    let url    = this.API_URL+'/magazine/articles';
    let params = new HttpParams();
    let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params     = params.set('magID', magID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }
  
  getArticsMagazineScroll(magID:any, lastIndex:any){
    let url    = this.API_URL+'/magazine/articles/scroll';
    let params = new HttpParams();
    let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params     = params.set('magID', magID);
    params     = params.set('lastIndex', lastIndex);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

  articleReadIt(artID, geoData){
    console.log(artID, geoData)
    let url           = this.API_URL+'/article/read';
    var form_data     = new FormData();

    form_data.append('artID', artID);
    form_data.append('geo', JSON.stringify(geoData));

    return this.http.post(url, form_data, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)

    })
  }

  delete_post(articleID :any)  :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let url           = this.API_URL+'/article/delete';
    let params        = new HttpParams();

    params = params.set('articleID', articleID);

    return this.http.post(url, params, {
      observe: 'response',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })
  }

  del_from_mg(article_id:any, post_id:any) :any{
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let url           = this.API_URL+'/delete/article';
    let params        = new HttpParams();

    params = params.set('article_id', article_id);
    params = params.set('post_id', post_id);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions

    })

  }

  getUserGossips(username){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossip/username';
    params            = params.set('username', username);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })
  }
  
  getUserGossipsScroll(userID, gossipID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossip/username/scroll';
    params            = params.set('userID', userID);
    params            = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })
  }

  
  gossipRate(gossip_id:string, ownerID:string, uid:string){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossip/rate';
    params            = params.set('gossip_id', gossip_id);
    params            = params.set('ownerID', ownerID);
    params            = params.set('uid', uid);


    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })

  }

  gossipReply(ownerID, gossipID, text, media, type){
    let url           = this.API_URL+'/gossip/reply/media';
    let params        = new FormData();

    for(let i =0; i < media.length; i++){
      console.log(media[i].file)
      params.append("upload", media[i].file, media[i].file['name']);
    }

    params.append('ownerID', ownerID);
    params.append('gossipID', gossipID);
    params.append('type', type);
    params.append('text', text);
    params.append('media', media);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)
    })
  }
  
  gossipNoMedia(ownerID, gossipID, text, type){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossip/reply';

    params            = params.set('ownerID', ownerID);
    params            = params.set('gossipID', gossipID);
    params            = params.set('text', text);
    params            = params.set('type', type);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)
    })
  }

  sendGossip(gossip, phantom, userID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossip/send';
    params            = params.set('gossip', gossip);
    params            = params.set('phantom', phantom);
    params            = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      headers: headerOptions
    })
  }

  daresInbox:any    = new Subject();
  daresInboxObs:any = this.daresInbox.asObservable();

  getDaresSub(){
    return this.getDares().subscribe((data:any)=>{
      this.daresInbox.next(data);
    })
  }
  
  profileScrolled:any    = new Subject();
  profileScrolledObs:any = this.profileScrolled.asObservable();

  getDaresScroll(lastID){
    return this.getDaresMore(lastID).subscribe((data:any)=>{
      this.daresInbox.next(data);
    })
  }
  
  getDares(){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();

    let url           = this.API_URL+'/dares/feed';

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  getDaresMore(lastID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();

    let url           = this.API_URL+'/dares/feed/scroll';
    params            = params.set('lastID', lastID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  
  postMyAnswerDiary(gossipID, ownerID, file:File){
    let url           = this.API_URL+'/post/diary';
    let params        = new FormData();

    params.append('gossipID', gossipID);
    params.append('ownerID', ownerID);
    params.append('file', file);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true
    })
  }

  getGossipsByUser(username:any, userID:any) :any{
    let url    = this.API_URL+'/gossip/username';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('username', username);
    params     = params.set('userID', userID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getGossipsByUserScroll(userID:any, gossipID:any) :any{
    let url    = this.API_URL+'/gossip/username/scroll';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('userID', userID);
    params     = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getGossipsByUser_regossips(username:any) :any{
    let url    = this.API_URL+'/gossip/username/regossips';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('username', username);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getGossipById_replies(gossipID:any) :any{
    let url    = this.API_URL+'/gossip/gossipID/replies';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  getGossipById(gossipID:any) :any{
    let url    = this.API_URL+'/gossip/id';
    let header = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params     = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      headers: header,
      observe: 'body',
      responseType: 'json',
    })
  }

  deleteGossip(gossipID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossips/delete';
    params            = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  deleteGossipInbox(gossipID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/gossips/inbox/delete';
    params            = params.set('gossipID', gossipID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }
  
  daysGone:any = new BehaviorSubject<any[]>([])
  daysGoneObs  = this.daysGone.asObservable();

  diariesDays(userID):any{
    this.s_diariesDaysGone(userID).subscribe((data:any) => {
      this.daysGone.next(data);
    }) 
  }

  s_diariesDaysGone(userID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/diaries/daysGone';
    params            = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  diariesDaysMore(userID, lastDate, lastTime){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/diaries/daysGone/more';
    params            = params.set('userID', userID);
    params            = params.set('lastDate', lastDate);
    params            = params.set('lastTime', lastTime);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  // magazines section 
  magazines:any = new BehaviorSubject<any[]>([])
  magazinesObs  = this.magazines.asObservable();

  magazinesTitles(userID):any{
    this.s_magazinesTitles(userID).subscribe((data:any) => {
      if(data.length > 0){
        if(this.magazines.getValue()[0]){
          this.magazines.next(this.magazines.getValue().concat(data)); 
        }else{
          this.magazines.next(data); 
        }
      }else{
        if(!this.magazines.getValue()[0]){
          this.magazines.next([{empty: true}])
        }
      }
    }) 
  }

  s_magazinesTitles(userID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/magazines/lobby';
    params            = params.set('userID', userID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  magazinesTitlesMore(userID, lastID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/magazines/lobby/more';
    params            = params.set('userID', userID);
    params            = params.set('lastID', lastID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  myMagazines:any = new BehaviorSubject<any[]>([])
  myMagazinesObs  = this.myMagazines.asObservable();
  addedCache: Map<string, boolean> = new Map();

  myMagazinesTitles(articleID: number) {
    this.s_myMagazinesTitles(articleID).subscribe((data: any) => {
      console.log(data)
      if (data.length > 0) {
        const newMags = this.myMagazines.getValue()[0] ? this.myMagazines.getValue().concat(data) : data;
        
        // Populate addedCache for this article
        newMags.forEach((mag: any) => {
          if (articleID && mag.added !== undefined) {
            const key = `${articleID}_${mag.mag_id}`;
            console.log(key)
            this.addedCache.set(key, mag.added);
          }
        });
  
        this.myMagazines.next(newMags);
      } else {
        if (!this.myMagazines.getValue()[0]) {
          this.myMagazines.next([{ empty: true }]);
        }
      }
    });
  }

  s_myMagazinesTitles(articleID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/magazines/mine';
    params            = params.set('articleID', articleID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }

  myMagazinesTitlessMore_sub(postID :any, lastID :any) :any{

    this.myMagazinesTitlessMore(postID, lastID).subscribe((data:any)=>{
      if(data.length > 0){
        if(this.myMagazines.getValue()[0]){
          this.myMagazines.next(this.myMagazines.getValue().concat(data)); 
        }
      }
    })
   
  }

  myMagazinesTitlessMore(postID, lastID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/magazines/mine/more';
    params            = params.set('postID', postID);
    params            = params.set('lastID', lastID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }


  checkArticleInMagazines(articleID: number, magIds: number[]): Observable<any> {
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/magazines/exists';
    params            = params.set('articleID', articleID.toString())
    params            = params.set('magIds', magIds.join(','));
  
    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })

  }
  

  addToMagazine(postID, magID){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/add/magazine';
    params            = params.set('magID', magID);
    params            = params.set('postID', postID);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)

    })
  }
  // magazines section   //  //  //

  decksScrollDown(userID, date){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/diaries/decks/more';
    params            = params.set('userID', userID);
    params            = params.set('date', date);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)

    })
  }

  getDecksCards = new BehaviorSubject<any>([])
  getDecksCardsObs = this.getDecksCards.asObservable();
  getDecks(userID, date) :any{
    this.getDecksDiaries(userID, date).subscribe((data:any)=>{
      if(data.length > 0){
        this.getDecksCards.next(this.getDecksCards.getValue().concat(data)); 
      }else{
        this.getDecksCards.next(data); 
      }
    })
  }
  
  getDecksDiaries(userID, date) :any{
    console.log('diaries')
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/user/diaries';
    params            = params.set('userID', userID);
    params            = params.set('date',   date);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)
    })

  }

  getMoreDeckCards(userID, date, lastDiary){
    let headerOptions = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params        = new HttpParams();
    let url           = this.API_URL+'/deck/more/cards';
    params            = params.set('userID', userID);
    params            = params.set('date',   date);
    params            = params.set('lastDiary', lastDiary);

    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: headerOptions
    })
  }


  updateArticlePic(file:File, articleID, user_id){
    let url           = this.API_URL+'/article/edit/picture';
    var form_data     = new FormData();

    form_data.append('file', file);
    form_data.append('article_id', articleID);
    form_data.append('user_id', user_id);

    return this.http.post(url, form_data, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true
    });

  }  

  articleUpload(photographs, userID:any, title:any, sub_title, cover:any, article:any) :any{
    let url           = this.API_URL+'/article/upload';
    let form_data        = new FormData();

    for(let i =0; i < photographs.length; i++){
      console.log(photographs[i].file)
      form_data.append("upload", photographs[i].file, photographs[i].file['name']);
    }

    let dataToAppend = {
      userID: userID,
      title: title,
      sub_title: sub_title,
      cover: cover,
    }
    form_data.append('article', JSON.stringify(article));
    form_data.append('data', JSON.stringify(dataToAppend));


    return this.http.post(url, form_data, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)
    })
  }
   
  editArticle(userID, postID, title, sub_title, cover, article) :any{
    let url           = this.API_URL+'/article/edit';
    var form_data     = new FormData();

    form_data.append('userID', userID);
    form_data.append('postID', postID);
    form_data.append('title', title);
    form_data.append('sub_title', sub_title);
    form_data.append('cover', cover);
    form_data.append('article', JSON.stringify(article));

    return this.http.post(url, form_data, {
      observe: 'body',
      responseType: 'json',
      reportProgress: true
    });

  }

  articleUploadImage(file: File, article_id){
    let url           = this.API_URL+'/article/edit/picture';
    var form_data     = new FormData();

    form_data.append('file', file);
    form_data.append('article_id', article_id);

    return this.http.post(url, form_data, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true
    });

  }

  postMyMagazine(magazineTitle, file:File){
    let url           = this.API_URL+'/create/magazine';
    let params        = new FormData();

    params.append('magazineTitle', magazineTitle);
    params.append('file', file);

    return this.http.post(url, params, {
      observe: 'events',
      responseType: 'json',
      reportProgress: true,
      context: new HttpContext().set(NGX_LOADING_BAR_IGNORED, true)
    })
  }

  searchUsers(search:string){
    let url           = this.API_URL+'/users/search';
    let params  = new HttpParams();
    let header  = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    params      = params.set('search', search);
  
    return this.http.post(url, params, {
      observe: 'body',
      responseType: 'json',
      headers: header
    });
  }

}

