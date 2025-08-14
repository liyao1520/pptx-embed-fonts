import JSZip from "jszip";

export async function toZip(file: ArrayBuffer): Promise<JSZip> {
  const zip = new JSZip();
  return zip.loadAsync(file);
}
