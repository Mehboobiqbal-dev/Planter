export interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin: string;
}
export interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}