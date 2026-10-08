import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-singlepost',
    imports: [RouterOutlet],
    templateUrl: './singlepost.component.html',
    styleUrls: ['./singlepost.component.css']
})
export class SinglepostComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
