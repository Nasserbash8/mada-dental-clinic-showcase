// uploadthing.config.ts
import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  patientImageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(({ file }) => {
    console.log("Uploaded file URL:", file.url);
    // You can save the image URL in the database here if needed
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
