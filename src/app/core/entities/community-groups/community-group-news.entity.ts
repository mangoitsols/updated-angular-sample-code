import { BaseEntity, CommunityGroupEntity, PaginatedEntity, UserEntity } from '@core/entities';
import { Expose, Transform, Type } from 'class-transformer';

export class CommunityGroupNewsList extends PaginatedEntity {
  @Type(() => CommunityGroupNewsEntity)
  groupNews: CommunityGroupNewsEntity[];
}

export class CommunityGroupNewsEntity extends BaseEntity {
  title: string;
  headline: string;
  text: string;
  author: string;
  priority: number;
  token: any;

  @Expose({ name: 'publication_date_from' })
  publicationDateFrom: string;

  @Expose({ name: 'publication_date_to' })
  publicationDateTo: string;

  attachment: string | null;
  tags: string | null;
  audience: string;
  guests: number;

  @Expose({ name: 'show_guest_list' })
  showGuestList: string;

  @Expose({ name: 'is_highlighted' })
  isHighlighted: string;

  @Expose({ name: 'update_image_url' })
  updateImageUrl: any | null;

  @Expose({ name: 'is_image_converted' })
  isImageConverted: number;

  @Type(() => UserEntity)
  user: UserEntity;

  @Type(() => CommunityGroupEntity)
  @Transform(({ value }) => value[0])
  groups: CommunityGroupEntity;

  @Expose({ name: 'news_image' })
  @Type(() => NewsImage)
  newsImage: NewsImage[];

  constructor(values?: Partial<CommunityGroupNewsEntity>) {
    super();
    this.initEntity(values);
  }
}

export class NewsImage {
  @Expose({ name: 'news_id' })
  newsId: number;
  @Expose({ name: 'news_image' })
  newsImage: string;
}
