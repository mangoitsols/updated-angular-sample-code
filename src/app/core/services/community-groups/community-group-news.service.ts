import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommunityGroupNewsEntity, CommunityGroupNewsList } from '@core/entities/community-groups/community-group-news.entity';
import { FilterQuery } from '@core/types';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupNewsService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _userId = JSON.parse(localStorage.getItem('user-data')).userId;

  constructor(private _http: HttpClient) {}

  find(groupId: number, queryParams?: FilterQuery): Observable<CommunityGroupNewsList> {
    return this._http.get<any>(`${this._apiUrl}/groupNews/groupId/${groupId}`, { params: queryParams });
  }

  get(newsId: number): Observable<CommunityGroupNewsEntity> {
    return this._http.get<any>(`${this._apiUrl}/get-news-by-id/${newsId}`).pipe(map(response => response.result));
  }

  delete(newsId: number): Observable<any> {
    return this._http.delete<any>(`${this._apiUrl}/news/${newsId}/user/${this._userId}`);
  }
}
