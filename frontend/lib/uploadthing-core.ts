import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: any) => {
  return { id: "user_123" };
};

export const ourFileRouter = {
  presentationUploader: f({
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
  .middleware(async ({ req }: any) => {
    const user = auth(req);
    if (!user) throw new UploadThingError("Unauthorized");
    return { userId: user.id };
  })
  .onUploadComplete(async ({ metadata, file }: any) => {
    return { uploadedBy: metadata.userId, url: file.url };
  }),
  
  imageUploader: f({
    "image/png": { maxFileSize: "4MB" },
    "image/jpeg": { maxFileSize: "4MB" },
  })
  .middleware(async ({ req }: any) => {
    const user = auth(req);
    if (!user) throw new UploadThingError("Unauthorized");
    return { userId: user.id };
  })
  .onUploadComplete(async ({ metadata, file }: any) => {
    return { uploadedBy: metadata.userId, url: file.url };
  }),
};

export type OurFileRouter = typeof ourFileRouter;
