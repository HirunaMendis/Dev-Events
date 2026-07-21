import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const maximumFileSize = 5 * 1024 * 1024;
const extensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const extension = extensions.get(image.type);

    if (!extension) {
      return Response.json({ error: "Upload a JPG, PNG, or WebP image." }, { status: 400 });
    }

    if (image.size > maximumFileSize) {
      return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
    }

    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
    const fileName = `${randomUUID()}.${extension}`;

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(path.join(uploadsDirectory, fileName), Buffer.from(await image.arrayBuffer()));

    return Response.json({ path: `/uploads/${fileName}` }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
