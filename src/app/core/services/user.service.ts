import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from '@core/helpers';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = environment.memberUrl;

  constructor(private _http: HttpClient) {}

  @Cacheable('getUserProfilePhoto', { ttl: 60000, handleError: true })
  getUserProfilePhoto(memberId: number, clubId: number, databaseId: number) {
    const salt: number = new Date().getTime();
    const params = {
      database_id: databaseId.toString(),
      member_id: memberId.toString(),
      club_id: clubId.toString(),
    };
    return this._http.get(`${this.baseUrl}profile-photo`, { params, responseType: 'blob' });
  }
}
