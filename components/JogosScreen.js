import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';

const API_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

const formatarData = (str) => {
  if (!str) return '';
  const [, m, d] = str.split('-');
  return `${d}/${m}`;
};

const converterHoraBrasilia = (timeStr) => {
  if (!timeStr) return '--:--';
  const match = timeStr.match(/(\d{2}):(\d{2})\s*UTC([+-]\d+)?/);
  if (!match) return timeStr.slice(0, 5);
  const h = parseInt(match[1]);
  const min = match[2];
  const offset = match[3] ? parseInt(match[3]) : 0;
  const brasiliaH = ((h - offset - 3) % 24 + 24) % 24;
  return `${String(brasiliaH).padStart(2, '0')}:${min}`;
};

const getStatusJogo = (dateStr) => {
  if (!dateStr) return 'upcoming';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const jogo = new Date(dateStr);
  jogo.setHours(0, 0, 0, 0);
  if (jogo.getTime() === hoje.getTime()) return 'hoje';
  if (jogo < hoje) return 'finalizado';
  return 'upcoming';
};

const BANDEIRAS = {
  'mexico': '🇲🇽', 'south africa': '🇿🇦', 'south korea': '🇰🇷', 'czech republic': '🇨🇿',
  'canada': '🇨🇦', 'bosnia & herzegovina': '🇧🇦', 'qatar': '🇶🇦', 'switzerland': '🇨🇭',
  'brazil': '🇧🇷', 'morocco': '🇲🇦', 'haiti': '🇭🇹', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'usa': '🇺🇸', 'paraguay': '🇵🇾', 'australia': '🇦🇺', 'turkey': '🇹🇷',
  'germany': '🇩🇪', 'curaçao': '🇨🇼', 'ivory coast': '🇨🇮', 'ecuador': '🇪🇨',
  'netherlands': '🇳🇱', 'japan': '🇯🇵', 'sweden': '🇸🇪', 'tunisia': '🇹🇳',
  'belgium': '🇧🇪', 'egypt': '🇪🇬', 'iran': '🇮🇷', 'new zealand': '🇳🇿',
  'spain': '🇪🇸', 'cape verde': '🇨🇻', 'saudi arabia': '🇸🇦', 'uruguay': '🇺🇾',
  'france': '🇫🇷', 'senegal': '🇸🇳', 'iraq': '🇮🇶', 'norway': '🇳🇴',
  'argentina': '🇦🇷', 'algeria': '🇩🇿', 'austria': '🇦🇹', 'jordan': '🇯🇴',
  'portugal': '🇵🇹', 'dr congo': '🇨🇩', 'uzbekistan': '🇺🇿', 'colombia': '🇨🇴',
  'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'croatia': '🇭🇷', 'ghana': '🇬🇭', 'panama': '🇵🇦',
};

const bandeira = (nome) => BANDEIRAS[nome?.toLowerCase()] || '🏳️';

export default function JogosScreen() {
  const [jogos, setJogos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const buscarJogos = useCallback(async () => {
    try {
      setErro('');
      const res = await fetch(API_URL);
      const json = await res.json();
      setJogos(json.matches || []);
    } catch {
      setErro('Não foi possível carregar os jogos. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { buscarJogos(); }, [buscarJogos]);

  const onRefresh = () => { setRefreshing(true); buscarJogos(); };

  const jogosFiltrados = jogos.filter((j) => {
    const status = getStatusJogo(j.date);
    if (filtro === 'hoje') return status === 'hoje';
    if (filtro === 'proximos') return status === 'upcoming';
    if (filtro === 'finalizados') return status === 'finalizado';
    return true;
  });

  const hojeCount = jogos.filter((j) => getStatusJogo(j.date) === 'hoje').length;

  const renderJogo = ({ item }) => {
    const status = getStatusJogo(item.date);
    const temPlacar = item.score?.ft;
    const placar = temPlacar ? item.score.ft.join(' × ') : null;

    return (
      <View style={[styles.card, status === 'hoje' && styles.cardHoje]}>
        <View style={styles.cardHeader}>
          <Text style={styles.rodada}>{item.round}</Text>
          <View style={styles.headerRight}>
            {item.group ? <Text style={styles.grupo}>{item.group}</Text> : null}
            {status === 'hoje' && (
              <View style={styles.hojeBadge}>
                <Text style={styles.hojeText}>● HOJE</Text>
              </View>
            )}
            <Text style={styles.data}>{formatarData(item.date)}</Text>
          </View>
        </View>

        <View style={styles.times}>
          <View style={styles.time}>
            <Text style={styles.bandeira}>{bandeira(item.team1)}</Text>
            <Text style={styles.nomeTime} numberOfLines={1}>{item.team1}</Text>
          </View>

          <View style={styles.placarBox}>
            {placar ? (
              <Text style={styles.placar}>{placar}</Text>
            ) : (
              <>
                <Text style={styles.horario}>{converterHoraBrasilia(item.time)}</Text>
                <Text style={styles.horarioLabel}>Brasília</Text>
              </>
            )}
          </View>

          <View style={[styles.time, { alignItems: 'flex-end' }]}>
            <Text style={styles.bandeira}>{bandeira(item.team2)}</Text>
            <Text style={[styles.nomeTime, { textAlign: 'right' }]} numberOfLines={1}>
              {item.team2}
            </Text>
          </View>
        </View>

        {item.ground ? (
          <Text style={styles.estadio}>📍 {item.ground}</Text>
        ) : null}
      </View>
    );
  };

  const FILTROS = [
    { key: 'todos',       label: 'Todos' },
    { key: 'hoje',        label: `🔴 Hoje${hojeCount > 0 ? ` (${hojeCount})` : ''}` },
    { key: 'proximos',    label: '📅 Próximos' },
    { key: 'finalizados', label: '✅ Finalizados' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroBtn, filtro === f.key && styles.filtroBtnAtivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!loading && (
        <Text style={styles.contador}>
          {jogosFiltrados.length} {jogosFiltrados.length === 1 ? 'jogo' : 'jogos'}
        </Text>
      )}

      {loading ? (
        <View style={styles.centro}>
          <ActivityIndicator color="#FFD700" size="large" />
          <Text style={styles.loadingText}>Carregando jogos da Copa 2026...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.erroIcon}>⚠️</Text>
          <Text style={styles.erroText}>{erro}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={buscarJogos}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jogosFiltrados}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderJogo}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Text style={styles.emptyText}>Nenhum jogo encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  filtros: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  filtroBtn: {
    flex: 1, paddingVertical: 7, alignItems: 'center',
    borderRadius: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
  },
  filtroBtnAtivo: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  filtroText: { color: '#666', fontSize: 10, fontWeight: '600' },
  filtroTextAtivo: { color: '#000', fontWeight: '800' },
  contador: { color: '#444', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  lista: { padding: 12, paddingTop: 4 },
  card: {
    backgroundColor: '#111', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#1e1e1e',
  },
  cardHoje: { borderColor: '#FFD700', borderWidth: 1.5 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  rodada: { color: '#444', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grupo: {
    color: '#FFD700', fontSize: 10, fontWeight: '700',
    backgroundColor: '#1a1600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  hojeBadge: {
    backgroundColor: '#FFD700', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  hojeText: { color: '#000', fontSize: 9, fontWeight: '900' },
  data: { color: '#444', fontSize: 10 },
  times: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  time: { flex: 1, alignItems: 'center', gap: 4 },
  bandeira: { fontSize: 28 },
  nomeTime: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  placarBox: { alignItems: 'center', paddingHorizontal: 8 },
  placar: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  horario: { color: '#FFD700', fontSize: 18, fontWeight: '800' },
  horarioLabel: { color: '#555', fontSize: 10, marginTop: 2 },
  estadio: { color: '#333', fontSize: 11, textAlign: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { color: '#555', marginTop: 12, fontSize: 14 },
  erroIcon: { fontSize: 36, marginBottom: 8 },
  erroText: { color: '#e74c3c', textAlign: 'center', fontSize: 13, marginBottom: 16, paddingHorizontal: 32 },
  retryBtn: { backgroundColor: '#FFD700', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#000', fontWeight: '800', fontSize: 13 },
  emptyText: { color: '#444', fontSize: 14 },
});