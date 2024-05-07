import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommunityGroupTaskEntity, CommunityGroupTasksList } from '@core/entities';
import { FilterQuery } from '@core/types';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupTasksService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  find(groupId: any, queryParams?: FilterQuery): Observable<CommunityGroupTasksList> {
    return this._http.get<any>(`${this._apiUrl}/getGroupTask/ByGroupId/${groupId}`, { params: queryParams });
  }

  get(taskId: any): Observable<CommunityGroupTaskEntity> {
    return this._http.get<any>(`${this._apiUrl}/get-task-by-id/${taskId}`).pipe(map(response => response.result[0]));
  }

  updateStatus(subTaskId: any, uncomplete?: FilterQuery): Observable<any> {
    // Create HttpParams object to handle query parameters
    const params = new HttpParams({ fromObject: uncomplete });

    return this._http.get<any>(`${this._apiUrl}/complete-subtask-by-id/${subTaskId}`, { params });
  }
}
