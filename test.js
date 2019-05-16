const { Node, Service, Exporter, MakeNeo4J, Source } = require("./index")

let auditSystem = new Source("https://place/pack.json", "audit")

let ecsCluster = new Node("ecsCluster");
let frontend = new Service("frontend");
let backend = new Service("backend");

let database = new Service("database"); // database is managed (doesn't sit on anything)

frontend.sitsOn(ecsCluster)
backend.sitsOn(ecsCluster)
frontend.dependsOn(backend)

backend.dependsOn(database)
backend.dependsOn(auditSystem.get("auditLogger"))

let exp = new Exporter();
const data = exp.export("api", frontend) // you only need the tip of the iceberg

console.log(MakeNeo4J(data))
