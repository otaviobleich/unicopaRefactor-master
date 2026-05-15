import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import BuscaScreen from './components/BuscaScreen';
import JogosScreen from './components/JogosScreen';
import dados from './assets/dados.json';
import DiaCard from './components/DiaCard';

// ─── Calendário local ─────────────────────────────────────────────────────────
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
      agrupado[data].sort((a, b) => a.hora_brasilia.localeCompare(b.hora_brasilia));
    });
    return agrupado;
  };

  const jogosAgrupados = agrupapordata(jogos);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {Object.entries(jogosAgrupados).map(([data, jogosDoDia]) => (
        <DiaCard key={data} data={data} jogos={jogosDoDia} />
      ))}
    </ScrollView>
  );
}

// ─── App principal com abas ───────────────────────────────────────────────────
function MainApp() {
  const { user, signOut } = useAuth();
  const [aba, setAba] = React.useState('jogos');

  const ABAS = [
    { key: 'jogos',      label: '🏆 Jogos'     },
    { key: 'calendario', label: '📅 Calendário' },
    { key: 'busca',      label: '🔍 Buscar'     },
  ];

  const renderConteudo = () => {
    if (aba === 'jogos')      return <JogosScreen />;
    if (aba === 'calendario') return <CalendarioScreen />;
    if (aba === 'busca')      return <BuscaScreen />;
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logo} source={require('./assets/unicopa.png')} />
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.userEmail}>👤 {user?.email}</Text>

      {/* Abas */}
      <View style={styles.tabs}>
        {ABAS.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={[styles.tab, aba === a.key && styles.tabActive]}
            onPress={() => setAba(a.key)}
          >
            <Text style={[styles.tabText, aba === a.key && styles.tabTextActive]}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>
        {renderConteudo()}
      </View>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
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
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  logo: { width: 160, height: 44, resizeMode: 'contain' },
  logoutBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  logoutText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  userEmail: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 10 },
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
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#FFD700' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#000', fontWeight: '800' },
  scroll: { alignItems: 'center', paddingBottom: 40, paddingTop: 8 },
});