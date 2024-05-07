import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommunityGroupsList } from '@core/entities';
import { FilterQuery } from '@core/types';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupsService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  find(queryParams?: FilterQuery): Observable<CommunityGroupsList> {
    return this._http.get<any>(`${this._apiUrl}/getAllApprovedGroups/`, { params: queryParams });
  }

  get(groupId: number): Observable<CommunityGroupsList> {
    return this._http.get<any>(`${this._apiUrl}/getAllApprovedGroups/?groupId=${groupId}`);
  }

  delete(groupId: number): Observable<any> {
    return this._http.delete<any>(`${this._apiUrl}/deleteGroup/${groupId}`);
  }

  leave(groupId: number, userId: number): Observable<any> {
    return this._http.delete<any>(`${this._apiUrl}/leaveGroup/user/${userId}/group_id/${groupId}`);
  }

  join(groupId: number, userId: number): Observable<any> {
    return this._http.post<any>(`${this._apiUrl}/joinGroup/user_id/${userId}/group_id/${groupId}`, {});
  }

  /**
   * Get all approved groups with group id and name for navigation
   * @returns {Observable<{id:number;name:string}>}
   */
  getAll(): Observable<any> {
    return this._http.get<{ id: number; name: string }>(`${this._apiUrl}/getAllApprovedGroupsForMobileNavigation/`);
  }
}
