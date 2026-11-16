import type { ScanResult, GeneratedDocs, DocSection } from "@repolens/shared";
import { ReadmeTemplate } from "./templates/readme.js";
import { ApiTemplate } from "./templates/api.js";
import { SetupTemplate } from "./templates/setup.js";
import { ArchitectureTemplate } from "./templates/architecture.js";

export class DocGenerator {
  private readme = new ReadmeTemplate();
  private api = new ApiTemplate();
  private setup = new SetupTemplate();
  private arch = new ArchitectureTemplate();

  generate(scan: ScanResult): GeneratedDocs {
    const now = new Date().toISOString();

    return {
      projectId: scan.meta.name,
      readme: this.readme.render(scan, now),
      api: scan.endpoints.length > 0 ? this.api.render(scan, now) : null,
      setup: this.setup.render(scan, now),
      architecture: this.arch.render(scan, now),
      generatedAt: now,
    };
  }
}
