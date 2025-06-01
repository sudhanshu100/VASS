export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  created: Date;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
}