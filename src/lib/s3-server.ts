import AWS from "aws-sdk";
import fs from "fs";

export async function downloadsFromS3(file_key: string) {
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

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const fileName = `/tmp/pdf-${new Date()}.pdf`;
    fs.writeFileSync(fileName, obj.Body as Buffer);
    return fileName;
  } catch (error) {
    console.error(error);
  }
}
