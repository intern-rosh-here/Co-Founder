const aws = require('aws-sdk');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.uploadFile = async (file, folder = 'uploads') => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
