// Constants
const PACE = 1200;   // ms between events
const MAX_NODES = 300;    // stop when graph reaches this size

// Color palette per group
const COLOR = {
  manufacturer:'#ff8c00', brand:'#ffbd59', model:'#ffc77f',
  dealer:'#ffd87f', vehicle:'#a3ffa3',
  prospect:'#87cefa', customer:'#ff9aa2',
  dtc:'#b39ddb', service:'#b2dfdb',
  consent:'#fff176', web:'#c4eaff',
  persona:'#ff1493', // hot pink for personas
  
  // Region colors
  'North': '#4CAF50',
  'South': '#2196F3',
  'East': '#FFC107',
  'West': '#9C27B0',
  'Central': '#F44336',
  'unknown': '#9E9E9E',
  
  // Income level colors
  'high': '#4CAF50',
  'medium': '#FFC107',
  'low': '#F44336'
};

// Clustering data
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const INCOME_LEVELS = ['low', 'medium', 'high'];
const DEALER_REGIONS = {
  'Dealer 001': 'North',
  'Dealer 002': 'South'
};

// Initialize graph
let nodes, edges, network, timer = null;

function initializeGraph() {
  nodes = new vis.DataSet();
  edges = new vis.DataSet();

  network = new vis.Network(
    document.getElementById('mynetwork'),
    {nodes, edges},
    {
      physics:{
        barnesHut:{
          gravitationalConstant:-2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09
        },
        stabilization: {
          enabled: true,
          iterations: 1000
        }
      },
      nodes: {
        shape: 'dot',
        size: 16,
        font: { 
          size: 12,
          color: '#000000'
        },
        color: {
          background: '#97C2FC',
          border: '#2B7CE9',
          highlight: {
            background: '#D2E5FF',
            border: '#2B7CE9'
          }
        }
      },
      edges: {
        smooth: {type: 'dynamic'},
        width: 1,
        color: {
          color: '#848484',
          highlight: '#848484'
        }
      },
      groups: Object.fromEntries(Object.entries(COLOR)
        .map(([g,c])=>[g,{
          color: {background: c},
          shape: 'dot',
          size: 16,
          font: { 
            size: 12,
            color: '#000000'
          }
        }]))
    }
  );

  // Add event listeners
  network.on('click', handleNetworkClick);
  
  // Initialize seed data
  initializeSeedData();
}

function initializeSeedData() {
  addNode('Hyundai','manufacturer');
  addNode('Genesis','brand');
  addEdge('Hyundai','Genesis','OWNS');

  ['Palisade','G70'].forEach(m=>{
    addNode(m,'model');
    addEdge(m==='G70'?'Genesis':'Hyundai', m, 'MODEL');
  });

  ['Dealer 001','Dealer 002'].forEach(addDealer);

  // Add personas after seed data
  addPersonas();
}

// Utility functions
function addNode(id, group, attr={}) {
  if(!nodes.get(id)) {
    const nodeData = {
      id,
      label: id,
      group,
      type: group,
      created: new Date().toISOString(),
      isCustomer: false,
      isProspect: group === 'prospect',
      ...attr
    };
    // delete nodeData.color; // Allow custom color for persona and other nodes
    nodes.add(nodeData);
  }
}

function addEdge(a, b, label, attr={}) {
  const edgeData = {
    from: a,
    to: b,
    label,
    title: tooltip(attr),
    ...attr,
    created: new Date().toISOString(),
    relationship: label
  };
  edges.add(edgeData);
}

function tooltip(obj) {
  return Object.entries(obj).map(([k,v])=>`${k}: ${v}`).join('\n');
}

function rand(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function addDealer(name) {
  addNode(name,'dealer', {region: DEALER_REGIONS[name] || rand(REGIONS)});
  addEdge('Hyundai', name, 'AUTHORIZED_DEALER');
  addEdge('Genesis', name, 'AUTHORIZED_DEALER');
}

// Simulation functions
function startSimulation() {
  if(timer) return;
  timer = setInterval(simStep, PACE);
  simStep();
  toggleSimulation(true);
}

function stopSimulation() {
  clearInterval(timer);
  timer = null;
  toggleSimulation(false);
}

function resetGraph() {
  stopSimulation();
  nodes.clear();
  edges.clear();
  initializeSeedData();
  document.getElementById('info-panel').style.display = 'none';
  log(`Nodes: ${nodes.length}   Edges: ${edges.length}`);
  network.fit({animation:{duration:300,easingFunction:'easeInOutQuad'}});
}

function toggleSimulation(running) {
  document.getElementById('startBtn').disabled = running;
  document.getElementById('stopBtn').disabled = !running;
}

function log(msg) {
  document.getElementById('log').textContent = msg;
}

// Event handlers
function handleNetworkClick(params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const nodeData = nodes.get(nodeId);
    formatInfoPanel(nodeData, 'Node');
  } else if (params.edges.length > 0) {
    const edgeId = params.edges[0];
    const edgeData = edges.get(edgeId);
    formatInfoPanel(edgeData, 'Edge');
  } else {
    document.getElementById('info-panel').style.display = 'none';
  }
}

function addPersonas() {
  console.log('addPersonas called');
  // Define personas
  const personas = [
    {
      id: 'Luxury SUV Enthusiast',
      criteria: node =>
        (node.group === 'customer' || node.group === 'prospect') &&
        (node.model === 'Palisade' || node.brand === 'Genesis' || node.body_style === 'SUV'),
      reason: 'interested in or owns a luxury SUV',
    },
    {
      id: 'Frequent Service Visitor',
      criteria: node => {
        if (!(node.group === 'customer' || node.group === 'prospect')) return false;
        // Count service visits and DTC events for this person
        const serviceVisits = edges.get({filter:e=>e.from===node.id && e.label==='VISIT'}).length;
        const dtcEvents = edges.get({filter:e=>e.from===node.id && e.label==='ALERT'}).length;
        return (serviceVisits + dtcEvents) >= 2;
      },
      reason: 'multiple service visits or DTC events',
    },
    {
      id: 'Digital Engager',
      criteria: node => {
        if (!(node.group === 'customer' || node.group === 'prospect')) return false;
        // Count web sessions for this person
        const webSessions = edges.get({filter:e=>e.from===node.id && e.label==='BROWSE'}).length;
        return webSessions >= 2;
      },
      reason: 'multiple web sessions',
    },
    {
      id: 'Budget-Conscious Shopper',
      criteria: node =>
        (node.group === 'customer' || node.group === 'prospect') &&
        (node.incomeLevel === 'low' || (edges.get({filter:e=>e.from===node.id && e.label==='BROWSE'}).length > 3 && !node.isCustomer)),
      reason: 'low income or frequent browser without purchase',
    },
    {
      id: 'New Customer',
      criteria: node => {
        if (node.group !== 'customer' || !node.purchaseDate) return false;
        const purchaseDate = new Date(node.purchaseDate);
        const now = new Date();
        const daysSincePurchase = (now - purchaseDate) / (1000 * 60 * 60 * 24);
        return daysSincePurchase <= 30;
      },
      reason: 'recently became a customer',
    },
  ];

  // Add persona nodes
  personas.forEach(persona => {
    addNode(persona.id, 'persona', { type: 'persona', color: { background: COLOR.persona } });
  });

  // Link personas to matching customers/prospects
  nodes.get().forEach(node => {
    personas.forEach(persona => {
      if (persona.criteria(node)) {
        console.log(`Mapping ${node.id} to persona ${persona.id}: ${persona.reason}`);
        addEdge(persona.id, node.id, 'persona_match', { reason: persona.reason });
      }
    });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGraph,
    startSimulation,
    stopSimulation,
    resetGraph,
    addNode,
    addEdge,
    nodes,
    edges,
    network
  };
} 