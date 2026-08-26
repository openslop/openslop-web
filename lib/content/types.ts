/**
 * Page copy is authored once as data so the same words can be rendered as HTML
 * for people and as Markdown for agents (see lib/content/markdown.ts).
 * Body strings support a tiny inline subset: `**bold**` and `[label](href)`.
 */
export interface DocSection {
  heading: string;
  body?: string[];
  list?: string[];
  /** `plain` keeps the About page's unbulleted contact list. */
  listStyle?: "disc" | "plain";
}

export interface Doc {
  path: string;
  title: string;
  description: string;
  updated?: string;
  intro?: string[];
  sections: DocSection[];
}
