import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Pagination } from '@core/entities/_extra/paginated.entity';
import { HttpClient } from '@angular/common/http';
import { CommunityGroupEventEntity, CommunityGroupEventParticipant, CommunityGroupEventsList, UserEntity } from '@core/entities';
import { map } from 'rxjs/operators';
import { FilterQuery } from '@core/types';

@Injectable({
  providedIn: 'root',
})
export class CommunityGroupEventsService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _userId = JSON.parse(localStorage.getItem('user-data')).userId;

  constructor(private _http: HttpClient) {}

  find(groupId: number, pagination: Partial<Pagination>): Observable<CommunityGroupEventsList> {
    return this._http.get<any>(`${this._apiUrl}/getGroupsEvents/ByGroupId/${groupId}`, { params: pagination });
  }

  getAll(groupId: number, params: FilterQuery): Observable<CommunityGroupEventEntity[]> {
    return this._http.get<any>(`${this._apiUrl}/groupEvents/groupId/${groupId}`, { params });
  }

  get(eventId: number): Observable<CommunityGroupEventEntity> {
    return this._http.get<any>(`${this._apiUrl}/get-event-by-id/${eventId}`).pipe(map(response => response.result[0]));
  }

  getApprovedParticipants(eventId: number): Observable<CommunityGroupEventParticipant[]> {
    return this._http.get<any>(`${this._apiUrl}/approvedParticipants/event/${eventId}`);
  }

  getUnApprovedParticipants(eventId: number): Observable<UserEntity[]> {
    return this._http.get<any>(`${this._apiUrl}/unapprovedParticipants/event/${eventId}`);
  }

  delete(eventId: number): Observable<any> {
    return this._http.delete<any>(`${this._apiUrl}/event/${eventId}`);
  }

  accept(eventId: number): Observable<any> {
    return this._http.put<any>(`${this._apiUrl}/acceptEvent/user/${this._userId}/event_id/${eventId}`, {});
  }

  deny(eventId: number): Observable<any> {
    return this._http.delete<any>(`${this._apiUrl}/denyEvent/user/${this._userId}/event_id/${eventId}`);
  }
}
