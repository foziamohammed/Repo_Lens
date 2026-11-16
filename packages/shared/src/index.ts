// Shared types used across CLI, API, and web app

export interface ProjectMeta {
  name: string;
  rootPath: string;
  scannedAt: string; // ISO timestamp
}

export interface FileNode {
  path: string;        // relative to project root
  name: string;
  extension: string;
  language: Language | null;
  sizeBytes: number;
}

export type Language =
  | "typescript"
  | "javascript"
  | "python"
  | "rust"
  | "go"
  | "java"
  | "csharp"
  | "cpp"
  | "ruby"
  | "php"
  | "other";

export interface FunctionInfo {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  isExported: boolean;
  isAsync: boolean;
  params: string[];
  jsDoc?: string;
}

export interface ClassInfo {
  name: string;
  filePath: string;
  startLine: number;
  methods: string[];
  isExported: boolean;
  jsDoc?: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  filePath: string;
  line: number;
  description?: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  isDev: boolean;
}

export interface ScanResult {
  meta: ProjectMeta;
  files: FileNode[];
  languages: Record<Language, number>; // language -> file count
  functions: FunctionInfo[];
  classes: ClassInfo[];
  endpoints: ApiEndpoint[];
  dependencies: DependencyInfo[];
  frameworks: string[];
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  sourceFiles: string[];
  generatedAt: string;
}

export interface GeneratedDocs {
  projectId: string;
  readme: DocSection;
  api: DocSection | null;
  setup: DocSection;
  architecture: DocSection;
  generatedAt: string;
}

export interface ChangeDetectionResult {
  outdatedSections: Array<{
    sectionId: string;
    reason: string;
    affectedFiles: string[];
  }>;
  missingSections: string[];
  checkedAt: string;
}
