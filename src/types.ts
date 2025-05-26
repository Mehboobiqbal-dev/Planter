export interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}

export interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  description: string;
}