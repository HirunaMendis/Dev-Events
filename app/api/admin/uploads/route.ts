import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const maximumFileSize = 5 * 1024 * 1024;
const extensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

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

    const fileName = `${randomUUID()}.${extension}`;
    const blob = await put(fileName, image, { access: "public", addRandomSuffix: false });

    return Response.json({ path: blob.url }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
