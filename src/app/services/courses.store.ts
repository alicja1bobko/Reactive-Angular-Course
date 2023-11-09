import { Injectable } from "@angular/core";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { LoadingService } from "../loading/loading.service";
import { MessagesService } from "../messages/messages.service";
@Injectable({
  providedIn: "root",
})
export class CoursesStore {
  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  constructor(
    private http: HttpClient,
    private loading: LoadingService,
    private messages: MessagesService
  ) {
    this.loadAllCourses();
  }

  private loadAllCourses() {
    const loadCourses$ = this.http.get<Course[]>("/api/courses").pipe(
      map((response) => response["payload"]),
      catchError((err) => {
        const message = "Could not load courses";
        this.messages.showErrors(message);
        console.log(message, err);
        return throwError(err);
      }),
      tap((courses) => this.subject.next(courses))
    );

    this.loading.showLoaderUntilCompleted(loadCourses$).subscribe();
  }

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) =>
        courses
          .filter((course) => course.category === category)
          .sort(sortCoursesBySeqNo)
      )
    );
  }
}
