import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      },
      region: "eu-north-1",
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: file_key,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "uploading to s3...",
          parseInt(((evt.loaded * 100) / evt.total).toString()),
          "%"
        );
      })
      .promise();

    await upload.then(() => {
      console.log("successfully uploaded", file_key);
    });

    return Promise.resolve({
      fileKey: file_key,
      fileName: file.name,
    });
  } catch (error) {}
}

export const getS3Url = (file_key: string) =>
  `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.ap-eu-north-1.amazonaws.com/${file_key}`;
