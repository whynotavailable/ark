let ideas = {}

class Node {
	constructor(name, model = {}) {
		this.name = name
		Object.assign(this, model, {
			flows: {}, // default to empty flows
			nodeType: this.nodeType()
		});

		if (this.idea != void 0) {
			let idea = ideas[this.idea] || (ideas[this.idea] = [])
			idea.push(this)
		}
	}

	sitsOn(...items) {
		for (let item of items) {
			this.addFlow("sitsOn", item)
		}
	}

	addFlow(name, item) {
		let flow = this.flows[name]

		if (flow == void 0) {
			flow = this.flows[name] = []
		}

		flow.push(item)
	}

	nodeType() {
		return "Node"
	}
}

function addEasyFlow(name) {
	Node.prototype[name] = function (...items) {
		for (let item of items) {
			this.addFlow(name, item);
		}
	}
}

addEasyFlow("sitsOn")
addEasyFlow("connectsTo")
addEasyFlow("dependsOn")

class Service extends Node {
	nodeType() {
		return "Service"
	}
}

class Exporter {
	export(packageName, ...items) {
		let nodeList = []
		let relationships = []

		for (const item of items) {
			this.extracter(item, nodeList, packageName);
		}

		// at this point the nodelist is full
		for (const node of nodeList) {
			for (const flow in node.flows) {
				for (const newNode of node.flows[flow]) {
					if (newNode.remote === true) {
						// external dep
						relationships.push({
							from: node.name,
							fromPackage: node.package,
							to: newNode.name,
							toPackage: newNode.package,
							toSource: newNode.location,
							type: flow
						})
					}
					else {
						relationships.push({
							from: node.name,
							fromPackage: node.package,
							to: newNode.name,
							toPackage: newNode.package,
							type: flow
						})
					}
				}
			}
		}

		return {
			nodes: nodeList,
			rels: relationships
		}
	}

	adder(node, nodeList, packageName) {
		if (nodeList.filter(x => x === node).length === 0) {
			nodeList.push(Object.assign(node, {
				package: packageName
			}));
			return true;
		}
		else {
			return false;
		}
	}

	extracter(node, nodeList, packageName) {
		if (this.adder(node, nodeList, packageName)) {
			// it wasn't already in the list
			for (const flow in node.flows) {
				for (const newNode of node.flows[flow]) {
					if (newNode.remote === true) {
						nodeList.push(newNode)
					}
					else {
						this.extracter(newNode, nodeList, packageName)
					}
					
				}
			}
		}
	}
}

function MakeNeo4J(data) {
	let stringBuilder = ""
	for (const node of data.nodes) {
		stringBuilder += `CREATE (${node.package}_${node.name}:${node.nodeType || "Remote"} {name: '${node.name}', package: '${node.package}'})\n`
	}

	let relStr = data.rels.map(rel => `    (${rel.fromPackage}_${rel.from})-[:${rel.type}]->(${rel.toPackage}_${rel.to})`).join(",\n")
	stringBuilder += "CREATE\n" + relStr
	return stringBuilder;
}

class Source {
	constructor(location, pack) {
		this.location = location
		this.package = pack;
	}

	get(name) {
		return {
			remote: true,
			location: this.location,
			package: this.package,
			name
		}
	}
}

module.exports = {
	Node,
	Service,
	Exporter,
	MakeNeo4J,
	Source
}
