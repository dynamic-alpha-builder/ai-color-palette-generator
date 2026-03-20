export interface Color {
  name: string;
  hex: string;
  description: string;
}

export interface Palette {
  id: string;
  prompt: string;
  colors: Color[];
  created_at: string;
}
