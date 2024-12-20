import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';  // Importando o CSS do Leaflet
import L from 'leaflet';  // Importando o Leaflet para manipular os ícones

// Componente para centralizar o mapa
const CenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null;
};

const GeoLocatization = ({ setInsideRadius }) => {
    // Localização fixa da PUCC Campinas
    const puecCampinas = { lat: -23.1943, lng: -47.8953 };  // Coordenadas da PUCC Campinas
    const userIp = '177.94.14.152';  // Substitua pelo IP do usuário desejado
    const [userPosition, setUserPosition] = useState({ lat: -23.1950, lng: -47.8980 });
    const [basePosition, setBasePosition] = useState(puecCampinas);  // Começa com PUCC Campinas


    const getLocationFromIP = async (ip) => {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,regionName,city,lat,lon`);
            if (response.data.status === 'fail') {
                console.error('Erro ao obter a localização do IP:', response.data.message);
                return null;
            }
            const { lat, lon } = response.data;
            return { lat, lng: lon };
        } catch (error) {
            console.error('Erro ao fazer requisição para o IP:', error);
            return null;
        }
    };

    useEffect(() => {
        // Carregar a posição do usuário usando o IP fornecido
        const loadUserPosition = async () => {
            const userCoordinates = await getLocationFromIP(userIp);
            // if (userCoordinates) {
            //     setUserPosition(userCoordinates);
            // }
        };

        loadUserPosition();
    }, []);

    // Calculando a distância entre a posição do usuário e a PUCC Campinas
    const calculateDistance = (position1, position2) => {
        const latLng1 = L.latLng(position1);
        const latLng2 = L.latLng(position2);
        return latLng1.distanceTo(latLng2); // Retorna a distância em metros
    };

    // Função para verificar se o usuário está dentro do raio de 500 metros
    useEffect(() => {
        if (userPosition) {
            const distance = calculateDistance(userPosition, puecCampinas);
            if (distance <= 500) {
                setInsideRadius(true);  // Usuário dentro do raio
            } else {
                setInsideRadius(false);  // Usuário fora do raio
            }
        }
    }, [userPosition, setInsideRadius]);

    // Configurando o ícone do Marker
    const defaultIcon = new L.Icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        shadowSize: [41, 41]
    });

    // Funções para mover o mapa para as diferentes localizações
    const moveToUserPosition = () => {
        setBasePosition(userPosition);
    };

    const moveToPuecCampinas = () => {
        setBasePosition(puecCampinas);
    };

    // Verificando a distância entre a posição do usuário e a PUCC Campinas
    const distance = userPosition ? calculateDistance(userPosition, puecCampinas) : 0;
    const circleColor = distance < 1000 ? 'green' : 'red';  // Se a distância for menor que 1km, raio será verde

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', border: '2px solid #007BFF', borderRadius: '8px' }}>
            {/* Botões para centralizar na posição do usuário ou na PUCC Campinas */}
            <div style={{
                position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000
            }}>
                <button onClick={moveToUserPosition} style={{
                    padding: '10px 20px', fontSize: '16px', marginRight: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer'
                }}>
                    Ir para minha posição
                </button>
                <button onClick={moveToPuecCampinas} style={{
                    padding: '10px 20px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer'
                }}>
                    Ir para PUCC Campinas
                </button>
            </div>

            {/* Mapa */}
            {basePosition && userPosition ? (
                <MapContainer center={basePosition} zoom={13} style={{ width: '100%', height: '100%' }}>
                    {/* Centraliza o mapa quando a posição muda */}
                    <CenterMap position={basePosition} />
                    {/* Usando o OpenStreetMap como camada */}
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Marker e círculo para a localização fixa da PUCC Campinas */}
                    <Marker position={puecCampinas} icon={defaultIcon}>
                        <Popup>Posição base (PUCC Campinas)</Popup>
                    </Marker>
                    <Circle
                        center={puecCampinas}
                        radius={500} // Raio de 500 metros
                        pathOptions={{ fillColor: circleColor, color: circleColor }}
                    />

                    {/* Marker para a localização do usuário */}
                    <Marker position={userPosition} icon={defaultIcon}>
                        <Popup>Você está aqui (IP {userIp})</Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <p>Carregando mapa...</p>
            )}
        </div>
    );
};

export default GeoLocatization;
