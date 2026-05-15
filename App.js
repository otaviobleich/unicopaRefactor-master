import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import BuscaScreen from './components/BuscaScreen';
import dados from './assets/dados.json';
import DiaCard from './components/DiaCard';

function CalendarioScreen() {
  const jogos = dados.jogos;

  const agrupapordata = (jogos) => {
    const agrupado = jogos.reduce((acc, jogo) => {
      const data = jogo.data_brasilia;
      if (!acc[data]) acc[data] = [];
      acc[data].push(jogo);
      return acc;
    }, {});

    Object.keys(agrupado).forEach((data) => {
      agrupado[data].sort((a, b) =>
        a.hora_brasilia.localeCompare(b.hora_brasilia)
      );
    });

    return agrupado;
  };

  const jogosAgrupados = agrupapordata(jogos);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.sectionTitle}>CALENDÁRIO</Text>
      {Object.entries(jogosAgrupados).map(([data, jogosDoDia]) => (
        <DiaCard key={data} data={data} jogos={jogosDoDia} />
      ))}
    </ScrollView>
  );
}

function MainApp() {
  const { user, signOut } = useAuth();
  const [aba, setAba] = React.useState('calendario'); 

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require('./assets/unicopa.png')}
        />
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Info do usuário */}
      <Text style={styles.userEmail}>👤 {user?.email}</Text>

      {/* Abas */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, aba === 'calendario' && styles.tabActive]}
          onPress={() => setAba('calendario')}
        >
          <Text style={[styles.tabText, aba === 'calendario' && styles.tabTextActive]}>
            📅 Calendário
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aba === 'busca' && styles.tabActive]}
          onPress={() => setAba('busca')}
        >
          <Text style={[styles.tabText, aba === 'busca' && styles.tabTextActive]}>
            🔍 Buscar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>
        {aba === 'calendario' ? <CalendarioScreen /> : <BuscaScreen />}
      </View>
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFD700', fontSize: 16 }}>Carregando...</Text>
      </View>
    );
  }

  return user ? <MainApp /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  logo: {
    width: 160,
    height: 44,
    resizeMode: 'contain',
  },
  logoutBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  userEmail: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
});