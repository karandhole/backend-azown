require('dotenv').config()
const { getSignedUrl } =require("@aws-sdk/s3-request-presigner") 

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  region:region
})

// uploads a file to s3
async function uploadFile(fileBuffer,imageName,fileMime) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: imageName,
    ContentType:fileMime
  }
  const command =new PutObjectCommand(uploadParams)
  return await s3Client.send(command);
}
exports.uploadFile = uploadFile

 async function getObjectSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  }
  const command = new GetObjectCommand(params);
  const seconds = 60
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
  return url
}
exports.getObjectSignedUrl = getObjectSignedUrl

async function getFile(key){
  const params = {
    Bucket:bucketName,
    Key:key
  }
  const command = new GetObjectCommand(params)
  const response = await s3Client.send(command)
  let fileContent = '';

    for await (const chunk of response.Body) {
      fileContent += chunk.toString();
    }

    const jsonData = JSON.parse(fileContent);
    return jsonData;
}
exports.getFile = getFile
function deleteFile(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  }

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}
exports.deleteFile = deleteFile


