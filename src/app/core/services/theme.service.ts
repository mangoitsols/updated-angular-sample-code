import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ThemeType } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  club_theme_obj: ThemeType;
  club_theme: any = new Subject();
  profile_imge: any = new Subject();

  constructor() {}

  getClubTheme(theme_data: ThemeType) {
    let imgUrl = '';

    if (theme_data && theme_data['club_image'] && theme_data?.['club_image'][0]?.theme_url) {
      imgUrl = theme_data['club_image'][0]?.theme_url;
    } else if (theme_data && theme_data['club_image']?.length == 0) {
      imgUrl = '../../../assets/img/no_image.png';
    } else {
      imgUrl = theme_data?.['theme_url'];
    }

    localStorage.setItem('club_theme', '');
    this.club_theme_obj = {
      logo_url: imgUrl,
      // 'logo_url': theme_data['club_image'][0]?.theme_url,
      sidebar_color: '#' + theme_data.sidebar_color,
      navigation_color: '#' + theme_data.navigation_color,
      icon_color: '#' + theme_data.icon_color,
      button_bgcolor: '#' + theme_data.button_bgcolor,
      button_text: '#' + theme_data.button_text,
      button_ic_color: '#' + theme_data.button_ic_color,
      team_id: theme_data.team_id,
      logo_text: theme_data.logo_text,
      logo_text_color: '#' + theme_data.logo_text_color,

      create_button_bgcolor: '#' + theme_data.create_button_bgcolor,
      create_button_text: '#' + theme_data.create_button_text,
      create_button_ic_color: '#' + theme_data.create_button_ic_color,
      cancel_button_bgcolor: '#' + theme_data.cancel_button_bgcolor,
      cancel_button_text: '#' + theme_data.cancel_button_text,
      cancel_button_ic_color: '#' + theme_data.cancel_button_ic_color,

      default_status: false,
      button_y_bgcolor: '#FFBE00',
      button_y_text: '#ffffff',
      button_ic_y_color: '#ffffff',
      button_r_bgcolor: '#FB5F5F',
      button_r_text: '#ffffff',
      button_ic_r_color: '#ffffff',
      button_g_bgcolor: '#FFBE00',
      button_g_text: '#ffffff',
      button_ic_g_color: '#ffffff',
      button_b_bgcolor: '#FFBE00',
      button_b_text: '#ffffff',
      button_ic_b_color: '#ffffff',
    };

    if (theme_data.logo_text) {
      this.club_theme_obj['logo_text'] = theme_data.logo_text;
    } else {
      this.club_theme_obj['logo_text'] = '';
    }

    if (theme_data.logo_text_color) {
      this.club_theme_obj['logo_text_color'] = '#' + theme_data.logo_text_color;
    } else {
      this.club_theme_obj['logo_text_color'] = '';
    }
    localStorage.setItem('club_theme', JSON.stringify(this.club_theme_obj));
    this.club_theme.next(this.club_theme_obj);
  }

  getClubDefaultTheme(club_id: number) {
    this.club_theme_obj = {
      logo_url: 'https://tineon.s3.eu-central-1.amazonaws.com/Leipzig/2022/May/Images/footer_menu_logo-1652419674317.png',
      sidebar_color: '#ffffff',
      navigation_color: '#98A5C6',
      icon_color: '#CAD2EB',
      button_bgcolor: '#ffffff',
      button_text: '#68759F',
      button_ic_color: '#ffffff',
      logo_text: 'Logo Text',
      logo_text_color: '#9095b2',
      team_id: club_id,

      create_button_bgcolor: '#FB5F5F',
      create_button_text: '#fff',
      create_button_ic_color: '#fff',
      cancel_button_bgcolor: '#FFEBEB',
      cancel_button_text: '#FB5F5F',
      cancel_button_ic_color: '#FB5F5F',

      default_status: true,
      button_y_bgcolor: '#FFBE00',
      button_y_text: '#ffffff',
      button_ic_y_color: '#ffffff',
      button_r_bgcolor: '#FB5F5F',
      button_r_text: '#ffffff',
      button_ic_r_color: '#ffffff',
      button_g_bgcolor: '#41AE4C',
      button_g_text: '#ffffff',
      button_ic_g_color: '#ffffff',
      button_b_bgcolor: '#6E63EE',
      button_b_text: '#ffffff',
      button_ic_b_color: '#ffffff',
    };
    this.club_theme.next(this.club_theme_obj);
    localStorage.setItem('club_theme', JSON.stringify(this.club_theme_obj));
  }

  getProfilePicture(memberPhotosuccess: string) {
    this.profile_imge.next(memberPhotosuccess);
  }
}
