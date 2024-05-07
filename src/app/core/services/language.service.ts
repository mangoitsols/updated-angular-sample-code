import { Injectable } from '@angular/core';
import * as deutschLanguage from '@assets/i18n/deutsch_language.json';
import * as englishLanguage from '@assets/i18n/english_language.json';
import * as turkischLanguage from '@assets/i18n/turkisch_language.json';
import * as italianLanguage from '@assets/i18n/italian_language.json';
import * as spanishLanguage from '@assets/i18n/spanish_language.json';
import * as frenchLanguage from '@assets/i18n/french_language.json';
import * as Language from '@assets/i18n/language.json';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  deutschLanguage: any = (deutschLanguage as any).default;
  englishLanguage: any = (englishLanguage as any).default;
  turkischLanguage: any = (turkischLanguage as any).default;
  italianLanguage: any = (italianLanguage as any).default;
  spanishLanguage: any = (spanishLanguage as any).default;
  frenchLanguage: any = (frenchLanguage as any).default;
  language: any = (Language as any).default;

  constructor() {}

  getLanguageFile() {
    const language: string = localStorage.getItem('language');
    if (language === 'en') {
      return this.englishLanguage;
    } else if (language === 'tr') {
      return this.turkischLanguage;
    } else if (language === 'it') {
      return this.italianLanguage;
    } else if (language === 'sp') {
      return this.spanishLanguage;
    } else if (language === 'fr') {
      return this.frenchLanguage;
    } else {
      return this.deutschLanguage;
    }
  }

  getBanner() {
    return this.language;
  }
}
