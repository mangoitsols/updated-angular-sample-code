import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { FilterQuery } from '@core/types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommunityGroupMembersList } from '@core/entities';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupMembersService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  get(groupId: number, queryParams?: FilterQuery): Observable<CommunityGroupMembersList> {
    return this._http
      .get<any>(`${this._apiUrl}/getGroupMembers/${groupId}`, { params: queryParams })
      .pipe(
        map(response => {
          return {
            pagination: response.pagination,
            members: response.groups,
          } as CommunityGroupMembersList;
        })
      );
  }
}
