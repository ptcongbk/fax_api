module.exports = {
    HOST: "ec2-18-208-102-44.compute-1.amazonaws.com",
    USER: "mhejkbjvamszsk",
    PASSWORD: "f69cf216fdb7feccee5aacd71813d3d04f621261a7ea18eeba546703d86b5ecc",
    DB: "d6r4ggie9re1re",
    port: 5432,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  };