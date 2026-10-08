import publication from "../data/recall-release.json" with { type: "json" };

export type RecallArtifact = { file: string; sha256: string; sizeBytes: number; url: string };
export type RecallRelease = {
  version: string;
  buildNumber: string;
  minimumSystemVersion: string;
  platform: "macos-arm64";
  manifestURL: string;
  complianceArtifacts: (RecallArtifact & { kind: "license" | "source" })[];
  artifacts: RecallArtifact[];
  validation?: { scope: "existing-owner-account"; notRunChecks: string[] };
};

// Only the publisher exports this public subset from a hash-bound accepted release.
// Private attestations, signing material and installation evidence never go here.
export function getRecallRelease(): RecallRelease | null {
  const value = publication.release as RecallRelease | null;
  if (!value) return null;
  if (value.validation) {
    const allowed = ["cleanInstall", "quarantineLaunch", "removal", "rollback"];
    const checks = value.validation.notRunChecks;
    if (value.validation.scope !== "existing-owner-account" || !Array.isArray(checks)
      || checks.some(check => !allowed.includes(check)) || JSON.stringify(checks) !== JSON.stringify([...new Set(checks)].sort())) throw new Error("Invalid Recall validation scope");
  }
  const version = /^\d+\.\d+\.\d+(?:\.\d+)?$/;
  if (!version.test(value.version) || !/^\d+$/.test(value.buildNumber) || value.platform !== "macos-arm64" || value.minimumSystemVersion !== "26.0") throw new Error("Invalid Recall public release identity");
  const prefix = `/downloads/chromadb-status/${value.version}-${value.buildNumber}/`;
  if (value.manifestURL !== `${prefix}VCodeRecall-${value.version}-${value.buildNumber}-macos-arm64.manifest.json` || !Array.isArray(value.artifacts) || value.artifacts.length !== 2) throw new Error("Invalid Recall public release metadata");
  for (const extension of ["zip", "dmg"]) {
    const name = `VCodeRecall-${value.version}-${value.buildNumber}-macos-arm64.${extension}`;
    const item = value.artifacts.find(artifact => artifact.file === name);
    if (!item || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.sizeBytes) || item.sizeBytes <= 0 || item.url !== prefix + name) throw new Error("Invalid Recall public artifact");
  }
  if (!Array.isArray(value.complianceArtifacts) || value.complianceArtifacts.length < 2 || value.complianceArtifacts.length > 5) throw new Error("Missing Recall licensing artifacts");
  const base = `VCodeRecall-${value.version}-${value.buildNumber}-macos-arm64`;
  for (const item of value.complianceArtifacts) {
    const suffixes = item.kind === "license" ? [".licenses.zip", ".licenses.txt", ".licenses.json"] : item.kind === "source" ? [".sources.zip", ".sources.tar.gz"] : [];
    if (!suffixes.some(suffix => item.file === base + suffix) || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.sizeBytes) || item.sizeBytes <= 0 || item.url !== prefix + item.file) throw new Error("Invalid Recall compliance artifact");
  }
  if (!value.complianceArtifacts.some(item => item.kind === "license") || !value.complianceArtifacts.some(item => item.kind === "source") || new Set(value.complianceArtifacts.map(item => item.file)).size !== value.complianceArtifacts.length) throw new Error("Incomplete Recall compliance files");
  return value;
}
