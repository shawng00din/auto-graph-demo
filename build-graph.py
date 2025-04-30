from pyvis.network import Network
import networkx as nx

# ---------- build graph ----------
G = nx.MultiDiGraph()

def add(node, **attrs): G.add_node(node, **attrs)
def link(a, b, rel, **attrs): G.add_edge(a, b, label=rel, **attrs)

add("Hyundai", type="Manufacturer")
add("Genesis", type="Brand")
link("Hyundai", "Genesis", "OWNS_BRAND", since=2015)

add("Palisade", type="Model", body_style="SUV")
add("G70",      type="Model", body_style="Sedan")
link("Hyundai", "Palisade", "HAS_MODEL")
link("Genesis", "G70",      "HAS_MODEL")

add("Dealer 123", type="Dealer", region="Bay Area")
link("Dealer 123", "Palisade", "INVENTORY_HAS", qty=4)

add("Vehicle VIN-123", type="Vehicle", vin="VIN-123", odo=28_450)
link("Palisade", "Vehicle VIN-123", "INSTANCE_OF")
link("Dealer 123","Vehicle VIN-123", "IN_STOCK", lot="Front Row")

add("Customer A", type="Customer", loyalty=84)
add("Household 456", type="Household", address="123 Oak St")
link("Customer A","Household 456","IN_HOUSEHOLD")
link("Customer A","Vehicle VIN-123","LEASES", monthly_payment=489, ends="2026-06-01")

add("Battery 82 %", type="BatteryState", soc=82)
add("DTC P0456",    type="DTCEvent",    severity=2)
link("Vehicle VIN-123","Battery 82 %","HAS_BATTERY_STATE")
link("Vehicle VIN-123","DTC P0456","REPORTED_DTC")

add("Consent SMS_OPT_IN", type="Consent", channel="SMS", status="OPT_IN")
link("Customer A","Consent SMS_OPT_IN","LATEST_CONSENT")

# ---------- visualise ----------
net = Network(height="750px", width="100%", directed=True, bgcolor="#ffffff")
net.toggle_physics(True)      

net.force_atlas_2based(
    gravity=-50,              # negative = repel harder
    central_gravity=0.003,    # small pull to center
    spring_length=250,        # DEFAULT ~200; larger = longer edges
    spring_strength=0.05,
    damping=0.4
)      # makes it draggable

# -------- node tooltip ----------
for n, data in G.nodes(data=True):
    tooltip = "\n".join(f"{k}: {v}" for k, v in data.items())
    net.add_node(n, label=n, title=tooltip)


for u, v, _, data in G.edges(data=True, keys=True):
    tooltip = "\n".join(f"{k}: {v}" for k, v in data.items() if k != "label")
    net.add_edge(u, v, label=data.get("label", ""), title=tooltip)


net.write_html("hyundai_interactive_graph.html", notebook=False)
print("✅  Open hyundai_interactive_graph.html in any browser")

