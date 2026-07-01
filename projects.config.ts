export interface ProjectConfig {
  slug: string;
  repo: string;
  branch?: string;
}

const GITHUB_USER = "Bovia";

export const PROJECTS: ProjectConfig[] = [
  {
    slug: "financial_basic_practice",
    repo: `${GITHUB_USER}/financial_basic_practice`,
  },
  {
    slug: "softexam-30d",
    repo: `${GITHUB_USER}/softexam-30d`,
  },
  {
    slug: "be-young",
    repo: `${GITHUB_USER}/be-young`,
  },
  {
    slug: "ruankao-senior",
    repo: `${GITHUB_USER}/ruankao-senior`,
  },
  {
    slug: "clinic-tools",
    repo: `${GITHUB_USER}/clinic_tools`,
  },
  {
    slug: "canvas-editor",
    repo: `${GITHUB_USER}/canvas-editor`,
  },
  {
    slug: "logic-flow",
    repo: `${GITHUB_USER}/logic-flow`,
  },
];
