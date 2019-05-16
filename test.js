const { Node, Service, Exporter, MakeNeo4J } = require("./index")

let ecsCluster = new Node("ecsCluster");
let frontend = new Service("frontend");
let backend = new Service("backend");

let database = new Service("database"); // database is managed (doesn't sit on anything)

frontend.sitsOn(ecsCluster)
backend.sitsOn(ecsCluster)
frontend.dependsOn(backend)

backend.dependsOn(database)

let exp = new Exporter();
const data = exp.export(frontend) // you only need the tip of the iceberg

console.log(MakeNeo4J(data))
