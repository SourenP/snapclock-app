config = {
    "DATABASE_URL": 'postgres://localhost:5432/snapclock',
    "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID,
    "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY,
    "S3_BUCKET": process.env.S3_BUCKET
}

module.exports = config;
