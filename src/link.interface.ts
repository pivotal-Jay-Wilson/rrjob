export interface ILink {
    id?: number;
    title: string;
    url: string;
    createdAt: Date;
    usedAt?: Date;
    authorId: string;
    categoryId: string;
    mediaDt: Date;
  }
