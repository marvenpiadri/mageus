import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { GimiappService } from 'src/app/gimiapp.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mag-articles',
  templateUrl: './mag-articles.component.html',
  styleUrls: ['./mag-articles.component.css'],
  imports: [ RouterOutlet, RouterLink, CommonModule]
})

export class MagArticlesComponent implements OnInit {
  IMG_URL = environment.IMG_URL;
  deploy  = environment.deploy;

  magID: any;
  articles: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private service: GimiappService,
    public router: Router,
    public changeDetector  : ChangeDetectorRef,
  ) {

  }

  articleHeight = 80;
  articleWidth;
  articleResolution;
  postResolution;
  ngAfterViewInit(): void {
    
    this.articleWidth = ((this. articleHeight / 9) * 16);
    this.postResolution = 'fit-in/'+this.articleHeight.toFixed(0)+'x'+this.articleWidth.toFixed(0)+'/';

    this.changeDetector.detectChanges();
  }

  ngOnInit(): void {
    this.magID = this.route.snapshot.paramMap.get('magID');

    this.route.paramMap.subscribe(params => {
      this.magID = params.get('magID');
      this.loadArticles();
    });

    this.loadArticles();
  }

  loadArticles() {
    this.service.getMagazineArticles(this.magID).subscribe((data: any) => {
      console.log(data)
      this.articles = data;
      this.loading = false;
    });
  }
  
  openArticle(article: any) {
    // Navigate to article reading view
    this.router.navigate(['/article', article.articleID]);
  }

  getAVG(stars, voters){

    if((stars / voters) > 0)
      return Number((stars / voters).toFixed(2));
    else
      return 0;
  }

}
