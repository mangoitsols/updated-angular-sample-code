import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class WeekdaysService {
  language: any;

  constructor(private lang: LanguageService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    this.language = this.lang.getLanguageFile();
  }

  public getAllWeekDayArray() {
    return [
      this.language.new_create_event.sunday,
      this.language.new_create_event.monday,
      this.language.new_create_event.tuesday,
      this.language.new_create_event.wednesday,
      this.language.new_create_event.thrusday,
      this.language.new_create_event.friday,
      this.language.new_create_event.saturday,
    ];
  }

  public getWeekdayArray() {
    return [
      { id: 1, name: this.language.new_create_event.monday },
      { id: 2, name: this.language.new_create_event.tuesday },
      { id: 3, name: this.language.new_create_event.wednesday },
      { id: 4, name: this.language.new_create_event.thrusday },
      { id: 5, name: this.language.new_create_event.friday },
      { id: 6, name: this.language.new_create_event.saturday },
      { id: 0, name: this.language.new_create_event.sunday },
    ];
  }

  public getAllWeekDayArrayName() {
    return [
      { id: 0, name: ['Sonntag', 'Sunday', 'dimanche', 'domenica', 'Воскресенье', 'domingo', 'Pazar'] },
      { id: 1, name: ['Montag', 'Monday', 'lundi', 'lunedì', 'понедельник', 'lunes', 'Pazartesi'] },
      { id: 2, name: ['Dienstag', 'Tuesday', 'mardi', 'martedì', 'вторник', 'martes', 'Salı'] },
      { id: 3, name: ['Mittwoch', 'Wednesday', 'mercredi', 'mercoledì', 'среда', 'miércoles', 'Çarşamba'] },
      { id: 4, name: ['Donnerstag', 'Thursday', 'jeudi', 'giovedì', 'четверг', 'jueves', 'Perşembe'] },
      { id: 5, name: ['Freitag', 'Friday', 'vendredi', 'venerdì', 'Пятница', 'viernes', 'Cuma'] },
      { id: 6, name: ['Samstag', 'Saturday', 'samedi', 'sabato', 'Суббота', 'sábado', 'Cumartesi'] },
    ];
  }

  public weekDayDropdownList() {
    return [
      { item_id: 0, description: this.language.new_create_event.sunday },
      { item_id: 1, description: this.language.new_create_event.monday },
      { item_id: 2, description: this.language.new_create_event.tuesday },
      { item_id: 3, description: this.language.new_create_event.wednesday },
      { item_id: 4, description: this.language.new_create_event.thrusday },
      { item_id: 5, description: this.language.new_create_event.friday },
      { item_id: 6, description: this.language.new_create_event.saturday },
    ];
  }

  public weekDaysArr() {
    return [
      { item_id: 0, description: 'SU' },
      { item_id: 1, description: 'MO' },
      { item_id: 2, description: 'TU' },
      { item_id: 3, description: 'WE' },
      { item_id: 4, description: 'TH' },
      { item_id: 5, description: 'FR' },
      { item_id: 6, description: 'SA' },
    ];
  }

  public recurrenceDropdownList() {
    return [
      { item_id: 0, item_text: this.language.new_create_event.does_not_repeat },
      { item_id: 1, item_text: this.language.new_create_event.every_day },
      { item_id: 2, item_text: this.language.new_create_event.every_week },
      { item_id: 3, item_text: this.language.new_create_event.every_month },
      { item_id: 4, item_text: this.language.new_create_event.every_year },
      { item_id: 5, item_text: this.language.new_create_event.custom },
    ];
  }

  public customRecurrenceDropdownList() {
    return [
      { item_id: 1, item_text: this.language.new_create_event.repeat_daily },
      { item_id: 2, item_text: this.language.new_create_event.repeat_weekly },
      { item_id: 3, item_text: this.language.new_create_event.repeat_monthly },
      { item_id: 4, item_text: this.language.new_create_event.repeat_yearly },
    ];
  }

  public visibilityDropdownList() {
    return [
      { item_id: 1, item_text: this.language.create_event.public },
      { item_id: 2, item_text: this.language.create_event.private },
      { item_id: 3, item_text: this.language.create_event.group },
      { item_id: 4, item_text: this.language.create_event.club },
    ];
  }

  public eventTypeDropdownList() {
    return [
      { item_id: 1, item_text: this.language.create_event.club_event },
      { item_id: 2, item_text: this.language.create_event.group_event },
      { item_id: 3, item_text: this.language.create_event.functionaries_event },
      { item_id: 4, item_text: this.language.create_event.courses },
      { item_id: 5, item_text: this.language.create_event.seminar },
    ];
  }

  public instuctorTypeDropdownList() {
    return [
      { item_id: 1, item_text: this.language.courses.internal },
      { item_id: 2, item_text: this.language.courses.external },
    ];
  }

  public type_dropdown() {
    return [
      { id: 0, name: this.language.create_task.individual },
      { id: 1, name: this.language.create_task.group },
    ];
  }

  public courseVisibilityDropdownList() {
    return [
      { item_id: 0, item_text: this.language.courses.external },
      { item_id: 1, item_text: this.language.courses.internal },
    ];
  }
}
