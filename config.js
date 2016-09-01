var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/snapclock';

module.exports = connectionString;
