// -author-image.service.ts

import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class UserImageService {
  private authorImg: { [key: string]: SafeUrl | string } = {};

  constructor() {}

  setAuthorImage(memberId: number, imageUrl: SafeUrl | string) {
    this.authorImg[memberId] = imageUrl;
  }

  getAuthorImage(memberId: number): SafeUrl | string {
    return this.authorImg[memberId] || '';
  }

  emptyAuthorImage() {
    return (this.authorImg = {});
  }
}
