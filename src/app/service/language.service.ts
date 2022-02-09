import { Injectable } from '@angular/core';
import { FindValueOperator } from 'rxjs/internal/operators/find';
import  *  as deutschLanguage from "../deutsch_language.json";
import  *  as englishLanguage from "../english_language.json";
import  *  as russischLanguage from "../russisch_language.json";
import  *  as turkischLanguage from "../turkisch_language.json";

@Injectable({
  providedIn: 'root'
})
export class LanguageService{
    constructor() { }
    deutschlanguage: any = (deutschLanguage as any).default;
    englishlanguage: any = (englishLanguage as any).default;
    russischLanguage: any = (russischLanguage as any).default;
    turkischLanguage: any = (turkischLanguage as any).default;

    getLanguaageFile() {
      let language = localStorage.getItem('language');
      if(language=="en"){
        return this.englishlanguage;
      }else if(language=="ru"){
        return this.russischLanguage;
      }else if(language=="tr"){
        return this.turkischLanguage;
      }else{
        return this.deutschlanguage;
      }
    }
}
