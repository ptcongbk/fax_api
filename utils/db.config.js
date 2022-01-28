module.exports = {
    HOST: "ec2-34-236-87-247.compute-1.amazonaws.com",
    USER: "shflbadutcjcan",
    PASSWORD: "25982259431e16c3375898cae93a8a87a5c20298546e81267f7c90d6eadd1d55",
    DB: "dcnos9claboqaj",
    port: 5432,
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  };