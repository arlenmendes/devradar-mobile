import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import {
  requestPermissionsAsync,
  getCurrentPositionAsync
} from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import {
  connect,
  disconnect,
  subscribeToNewDevelopers
} from '../services/socket';

export default ({ navigation }) => {
  const [developers, setDevelopers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [techs, setTechs] = useState('');

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync({});

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccurancy: true
        });

        const { latitude, longitude } = coords;

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      }
    }

    loadInitialPosition();
  }, []);

  useEffect(() => {
    subscribeToNewDevelopers(developer => {
      if (developers.length > 0) {
        setDevelopers([...developers, developer]);
      } else {
        setDevelopers([developer]);
      }
    });
  }, [developers]);

  function setupWebsocket() {
    disconnect();

    const { latitude, longitude } = currentLocation;

    connect(latitude, longitude, techs);
  }

  async function loadDevelopers() {
    const { longitude, latitude } = currentLocation;

    const response = await api.get('/search', {
      params: {
        latitude,
        longitude,
        techs
      }
    });
    setDevelopers(response.data);
    setupWebsocket();
  }

  function handleRegionChanged(region) {
    setCurrentLocation(region);
  }

  if (!currentLocation) {
    return null;
  }

  return (
    <>
      <MapView
        onRegionChangeComplete={handleRegionChanged}
        initialRegion={currentLocation}
        style={style.map}
      >
        {developers.map(developer => (
          <Marker
            key={developer._id}
            coordinate={{
              longitude: developer.location.coordinates[0],
              latitude: developer.location.coordinates[1]
            }}
          >
            <Image
              style={style.avatar}
              source={{
                uri: developer.avatarUrl
              }}
            />
            <Callout
              onPress={() => {
                navigation.navigate('Profile', {
                  githubUsername: developer.githubUsername
                });
              }}
            >
              <View style={style.callout}>
                <Text style={style.developerName}>{developer.name}</Text>
                <Text style={style.developerBio}>{developer.bio}</Text>
                <Text style={style.developerTechs}>
                  {developer.techs.join(', ')}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={style.searchForm}>
        <TextInput
          style={style.searchInput}
          placeholder="Buscar devs por tecnologia..."
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          value={techs}
          onChangeText={setTechs}
        />
        <TouchableOpacity onPress={loadDevelopers} style={style.loadButton}>
          <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  map: {
    flex: 1
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },

  callout: {
    width: 260
  },
  developerName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  developerBio: {
    color: '#666',
    marginTop: 5
  },
  developerTechs: {
    marginTop: 5
  },

  searchForm: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row'
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4
    },
    elevation: 2
  },

  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8E4DFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15
  }
});
