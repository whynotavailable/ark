let ideas = {}

class Node {
	constructor(name, model = {}) {
		this.name = name
		Object.assign(this, model, {
			flows: {} // default to empty flows
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
	export(...items) {
		let nodeList = []
		let relationships = []

		for (const item of items) {
			this.extracter(item, nodeList);
		}

		// at this point the nodelist is full
		for (const node of nodeList) {
			for (const flow in node.flows) {
				for (const newNode of node.flows[flow]) {
					relationships.push({
						from: node.name,
						to: newNode.name,
						type: flow
					})
				}
			}
		}

		return {
			nodes: nodeList,
			rels: relationships
		}
	}

	adder(node, nodeList) {
		if (nodeList.filter(x => x === node).length === 0) {
			nodeList.push(node);
			return true;
		}
		else {
			return false;
		}
	}

	extracter(node, nodeList) {
		if (this.adder(node, nodeList)) {
			// it wasn't already in the list
			for (const flow in node.flows) {
				for (const newNode of node.flows[flow]) {
					this.extracter(newNode, nodeList)
				}
			}
		}
	}
}

function MakeNeo4J(data) {
	let stringBuilder = ""
	for (const node of data.nodes) {
		stringBuilder += `CREATE (${node.name}:${node.nodeType()} {name: '${node.name}'})\n`
	}

	let relStr = data.rels.map(rel => `    (${rel.from})-[:${rel.type}]->(${rel.to})`).join(",\n")
	stringBuilder += "CREATE\n" + relStr
	return stringBuilder;
}

module.exports = {
	Node,
	Service,
	Exporter,
	MakeNeo4J
}
