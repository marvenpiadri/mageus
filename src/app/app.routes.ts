import { Routes } from '@angular/router';
import { App_partsComponent }        from './app_parts/app_parts.component';
import { ProfileComponent }          from './app_parts/profile/profile.component';
import { FeedComponent }             from './app_parts/feed/feed.component';
import { Session_loginComponent }    from './app_parts/session_login/session_login.component';
import { Session_signupComponent }   from './app_parts/session_signup/session_signup.component';
import { SettingsComponent }         from './app_parts/settings/settings.component'
import { WallpapersComponent }       from './app_parts/settings/wallpapers/wallpapers.component'
import { InfosComponent }            from './app_parts/settings/infos/infos.component'
import { UndercoverComponent }       from './app_parts/undercover/undercover.component';
import { ArticlesComponent }        from './app_parts/articles/articles.component';

//magazine + article
import { Create_articleComponent }  from './app_parts/create_article/create_article.component';
import { PostsComponent }           from './app_parts/posts/posts.component'
import { NewspaperComponent }       from './app_parts/articles/newspaper/newspaper.component';
import { SinglepostComponent }      from './app_parts/singlepost/singlepost.component';
import { Magazines_lobbyComponent } from './app_parts/magazines_lobby/magazines_lobby.component';
import { AuthGuard } from './auth/auth.guard.service';
import { MagazinesComponent } from './app_parts/profile/magazines/magazines.component';
import { MagArticlesComponent } from './app_parts/magazines_lobby/mag-articles/mag-articles.component';
import { GuestGuard } from './auth/guest-guard.service';

export const routes: Routes = [
    
    { path: '', component: App_partsComponent,
      children: [
        { path: '', component: UndercoverComponent,    
          children:[
            { path: '', redirectTo: "feeds", pathMatch: 'full' },
            { path: 'login', component: Session_loginComponent, canActivate: [GuestGuard] },
            { path: 'create', component: Session_signupComponent, canActivate: [GuestGuard] },
            { path: 's', component: SettingsComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard],
              children:[
                { path:'', component: WallpapersComponent },
                { path:'account', component: InfosComponent }
              ]
            },
            { path: 'feeds', component: FeedComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard],
              children:[
                { path: '', component: PostsComponent},
              ]
            },
            // { path:'gossips', component: Inbox_daresComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard]},
            { path:'write', component: Create_articleComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard]},
            { path:'edit/:postID', component: Create_articleComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard]},
            { path:':userID', component: ProfileComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard],
              children:[ 
                { path: '', component: PostsComponent },
                { path: 'articles', component: ArticlesComponent, 
                  children:[
                    { path: ':slug/:artID', component: NewspaperComponent }
                  ]
                },
                { path: 'magazines', component: MagazinesComponent, 
                  children:[
                    { path: ':magID', component: Magazines_lobbyComponent,
                      children:[
                        { path: '', component: MagArticlesComponent,
                          children:[
                            { path: ':slug/:artID', component: NewspaperComponent }
                          ] 
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            { path:'magazine/:magID', component: Magazines_lobbyComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard],
              children:[
                { path: '', component: PostsComponent },
                { path: 'Articles', component: ArticlesComponent , 
                  children:[
                    { path: ':slug/:artID', component: NewspaperComponent }
                  ]
                }
              ]
            },
  
            { path:'a', component: SinglepostComponent, canActivateChild: [AuthGuard], canActivate: [AuthGuard],
              children:[
                { path:':articleID', component: PostsComponent }
              ]
            },
  
          ]
        },
  
      ]
  
    },
    { path: '**', redirectTo: 's' }
];
