import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";
import L from "leaflet";

// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

// Component to handle clicking on the map
const ClickableMap = ({ setDroppedMarker }) => {
  useMapEvents({
    click(e) {
      setDroppedMarker({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
};

const Home = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [location, setLocation] = useState(null); // Initially null, updates with live location
  const [search, setSearch] = useState("");
  const [searchLocation, setSearchLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [droppedMarker, setDroppedMarker] = useState(null); // Marker manually dropped by user

  // 📌 Get User’s Live Location as Default
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 📌 Find a City Using OpenStreetMap API
  const findCity = async () => {
    if (!search) return;
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${search}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setSearchLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // 📌 Fetch Nearby Places (Mock API)
  const fetchNearbyPlaces = async () => {
    try {
      const mockData = [
        { name: "Restaurant A", lat: location.lat + 0.002, lon: location.lon + 0.002 },
        { name: "Hotel B", lat: location.lat - 0.002, lon: location.lon - 0.002 },
      ];
      setNearbyPlaces(mockData);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces();
    }
  }, [location]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1 style={{ color: "#333" }}>Welcome to Our Application</h1>

      {isAuthenticated && user ? (
        <>
          <h2 style={{ color: "#007bff" }}>Hi, {user.first_name}!</h2>

          {/* Search Input */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter city name"
              style={{
                padding: "8px",
                width: "250px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={findCity}
              style={{
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </div>

          {/* Button to Re-Center Map to User’s Location */}
          <button
            onClick={() => setLocation({ ...location })}
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            Re-Center Map to My Location
          </button>

          {/* Map Component */}
          {location ? (
            <div style={{ height: "500px", width: "80%", margin: "auto", border: "2px solid #ddd", borderRadius: "10px" }}>
              <MapContainer center={[location.lat, location.lon]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* 🟢 User's Live Location */}
                <Marker position={[location.lat, location.lon]} icon={greenIcon}>
                  <Popup>
                    <strong style={{ color: "green" }}>🟢 Your Current Location</strong>
                  </Popup>
                </Marker>

                {/* 🔴 Nearby Places */}
                {nearbyPlaces.map((place, index) => (
                  <Marker key={index} position={[place.lat, place.lon]} icon={redIcon}>
                    <Popup>
                      <strong style={{ color: "red" }}>🔴 {place.name}</strong>
                    </Popup>
                  </Marker>
                ))}

                {/* 🔵 Searched Location */}
                {searchLocation && (
                  <Marker position={[searchLocation.lat, searchLocation.lon]} icon={blueIcon}>
                    <Popup>
                      <strong style={{ color: "blue" }}>🔵 Search Location: {search}</strong>
                    </Popup>
                  </Marker>
                )}

                {/* 🟠 Manually Dropped Pin */}
                {droppedMarker && (
                  <Marker position={[droppedMarker.lat, droppedMarker.lon]}>
                    <Popup>
                      <strong style={{ color: "orange" }}>🟠 Custom Pin</strong>
                    </Popup>
                  </Marker>
                )}

                {/* Add Clickable Map Event */}
                <ClickableMap setDroppedMarker={setDroppedMarker} />
              </MapContainer>
            </div>
          ) : (
            <p style={{ fontSize: "18px", color: "#666" }}>Fetching your location...</p>
          )}
        </>
      ) : (
        <p style={{ fontSize: "18px", color: "#666" }}>Please log in to see the map.</p>
      )}
    </div>
  );
};

export default Home;
