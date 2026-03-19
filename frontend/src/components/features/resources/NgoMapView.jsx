import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card } from "@/components/ui/Card";

// --- Static dataset: NGOs related to autism (sample up to 30 entries) ---
const staticNgos = [
    {
        id: "afa-delhi",
        name: "Action For Autism (AFA) — National Centre for Autism",
        description:
            "Pioneering autism organisation (National Centre for Autism, Jasola Vihar, New Delhi).",
        position: { lat: 28.548244, lng: 77.288719 },
        website: "https://www.autism-india.org",
    },
    {
        id: "autism-society-bengaluru",
        name: "Autism Society of India (ASI) — Bangalore",
        description:
            "Major national society supporting autistic individuals and families.",
        position: { lat: 12.971599, lng: 77.594566 },
        website: "https://autismsocietyofindia.org",
    },
    {
        id: "ummeed-mumbai",
        name: "Ummeed Child Development Center — Mumbai",
        description:
            "Specialised services for developmental disabilities, including autism intervention.",
        position: { lat: 18.992032, lng: 72.831476 },
        website: "https://www.ummeed.org",
    },
    {
        id: "national-trust-delhi",
        name: "The National Trust for Welfare of Persons with Autism (Govt. body)",
        description:
            "Statutory body under the National Trust Act — national-level welfare & schemes.",
        position: { lat: 28.609, lng: 77.0377 },
        website: "https://nationaltrust.nic.in",
    },
    {
        id: "india-autism-center",
        name: "India Autism Center (IAC) — West Bengal",
        description:
            "Not-for-profit autism centre (residential, training, research; Sirakole, near Kolkata).",
        position: { lat: 22.9, lng: 88.0 },
        website: "https://indiaautismcenter.org",
    },
    {
        id: "asha-chandigarh",
        name: "Asha Child Care & Development Centre — Chandigarh",
        description:
            "Centre providing therapy & development services for children with autism.",
        position: { lat: 30.719482, lng: 76.831733 },
        website: "https://ashachildcare.com",
    },
    // --- Add more NGOs here (up to 30) ---
    {
        id: "sample-1",
        name: "Sample Autism Centre — Pune",
        description: "Example regional autism centre (use as template).",
        position: { lat: 18.5204, lng: 73.8567 },
        website: "",
    },
    {
        id: "sample-2",
        name: "Sample Autism Centre — Kolkata",
        description: "Example regional autism centre (use as template).",
        position: { lat: 22.5726, lng: 88.3639 },
        website: "",
    },
    {
        id: "sample-3",
        name: "Sample Autism Centre — Hyderabad",
        description: "Example regional autism centre (use as template).",
        position: { lat: 17.385, lng: 78.4867 },
        website: "",
    },
    {
        id: "sample-4",
        name: "Sample Autism Centre — Chennai",
        description: "Example regional autism centre (use as template).",
        position: { lat: 13.0827, lng: 80.2707 },
        website: "",
    },
    {
        id: "sample-5",
        name: "Sample Autism Centre — Jaipur",
        description: "Example regional autism centre (use as template).",
        position: { lat: 26.9124, lng: 75.7873 },
        website: "",
    },
    {
        id: "sample-6",
        name: "Sample Autism Centre — Lucknow",
        description: "Example regional autism centre (use as template).",
        position: { lat: 26.8467, lng: 80.9462 },
        website: "",
    },
    {
        id: "sample-7",
        name: "Sample Autism Centre — Patna",
        description: "Example regional autism centre (use as template).",
        position: { lat: 25.5941, lng: 85.1376 },
        website: "",
    },
    {
        id: "sample-8",
        name: "Sample Autism Centre — Bhopal",
        description: "Example regional autism centre (use as template).",
        position: { lat: 23.2599, lng: 77.4126 },
        website: "",
    },
    {
        id: "sample-9",
        name: "Sample Autism Centre — Guwahati",
        description: "Example regional autism centre (use as template).",
        position: { lat: 26.1445, lng: 91.7362 },
        website: "",
    },
    {
        id: "sample-10",
        name: "Sample Autism Centre — Ahmedabad",
        description: "Example regional autism centre (use as template).",
        position: { lat: 23.0225, lng: 72.5714 },
        website: "",
    },
];

const NgoMapView = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapCenter = [23.2599, 77.4126]; // India central approx (Bhopal)

    useEffect(() => {
        // For now, we use static NGO data
        setNgos(staticNgos);
        setLoading(false);
    }, []);

    return (
        <Card className="overflow-hidden">
            <div style={{ height: "600px", width: "100%" }}>
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        Loading map data...
                    </div>
                ) : (
                    <MapContainer
                        center={mapCenter}
                        zoom={5}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {ngos.map((ngo) => (
                            <Marker
                                key={ngo.id}
                                position={[ngo.position.lat, ngo.position.lng]}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <h4 className="font-bold">{ngo.name}</h4>
                                        <p>{ngo.description}</p>
                                        {ngo.website && (
                                            <a
                                                href={ngo.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                Visit Website
                                            </a>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </Card>
    );
};

export default NgoMapView;
