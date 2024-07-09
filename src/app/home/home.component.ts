import { Component, OnInit } from '@angular/core';
import { Course, sortCoursesBySeqNo } from '../model/course';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { CoursesService } from '../services/courses.service';
import { LoadingService } from '../loading/loading.service';
import { MessagesService } from '../messages/messages.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public beginnerCourses$: Observable<Course[]>;
  public advancedCourses$: Observable<Course[]>;

  constructor(private coursesService: CoursesService, private loadingService: LoadingService, private messagesService: MessagesService) {}

  ngOnInit() {
    this.reloadCourses();
  }

  public reloadCourses() {
    // this.loadingService.loadingOn();

    // const courses$ = this.coursesService.loadAllCourses().pipe(
    //   map((courses) => courses.sort(sortCoursesBySeqNo)),
    //   finalize(() => this.loadingService.loadingOff())
    // );

    const courses$ = this.coursesService.loadAllCourses().pipe(
      map((courses) => courses.sort(sortCoursesBySeqNo)),
      catchError(err => {
        const message = 'could not load courses'
        this.messagesService.showErrors(message)
        console.error(message, err);
        return throwError(err)
      })
    );

    const loadCourses$ = this.loadingService.showLoaderUntilCompleted<Course[]>(courses$);

    this.beginnerCourses$ = loadCourses$.pipe(map((courses) => courses.filter((course) => course.category === 'BEGINNER')));
    this.advancedCourses$ = loadCourses$.pipe(map((courses) => courses.filter((course) => course.category === 'ADVANCED')));
  }
}
