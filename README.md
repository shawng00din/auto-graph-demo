# Auto Knowledge Graph Simulator

An interactive visualization of an automotive knowledge graph, demonstrating relationships between manufacturers, dealers, vehicles, and customers.

## Live Demo

Check out the live demo: [Auto Knowledge Graph Simulator](https://autographsim.netlify.app/)

## Features

- Real-time graph simulation
- Interactive node grouping by type, region, and income level
- Detailed node information panel
- Customer and prospect status tracking
- Dynamic relationship visualization

## Setup

1. Clone the repository:
```bash
git clone https://github.com/shawng00din/auto-graph-demo.git
```

2. Open `index.html` in a web browser to run the simulation.

## Dependencies

- vis-network.js (included in the repository)

## Project Structure

- `index.html` - Main visualization interface
- `vis-network.min.js` - Network visualization library
- `build-graph.py` - Python script for generating the initial graph structure
- `hyundai_interactive_graph.html` - Alternative visualization interface
- `netlify.toml` - Netlify deployment configuration

## Usage

1. Click "Start Simulation" to begin the graph generation
2. Use the "Group By" dropdown to organize nodes by different attributes
3. Click on nodes to view detailed information
4. Use "Reset Graph" to clear and start over

## Development

The project uses:
- HTML/CSS/JavaScript for the frontend
- Python for graph generation
- vis-network.js for visualization

## Deployment

The project is configured for deployment on Netlify. The `netlify.toml` file includes:
- Build settings for static site deployment
- Redirect rules for proper routing

## License

MIT License 