export interface FAQ {
  document: any;
  category: number;
  createdAt: string;
  description: string;
  faqCategory: FAQCategory;
  id: number;
  image: string;
  modifiedAt: string;
  position: number;
  team_id: number;
  title: string;
  approved_status: number;
}

export interface FAQCategory {
  approved_status: any;
  category_description: string;
  category_position: number;
  category_title: string;
  createdAt: string;
  id: number;
  modifiedAt: string;
  team_id: number;
  author: any;
}
