import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const formatDate = (str) => {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
};

const BANDEIRAS = {
  // Português
  'méxico': '🇲🇽', 'africa do sul': '🇿🇦', 'áfrica do sul': '🇿🇦', 'coreia do sul': '🇰🇷',
  'república tcheca': '🇨🇿', 'canadá': '🇨🇦', 'bósnia e herzegovina': '🇧🇦',
  'catar': '🇶🇦', 'suíça': '🇨🇭', 'brasil': '🇧🇷', 'marrocos': '🇲🇦',
  'haiti': '🇭🇹', 'escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'estados unidos': '🇺🇸', 'paraguai': '🇵🇾',
  'austrália': '🇦🇺', 'turquia': '🇹🇷', 'alemanha': '🇩🇪', 'curaçao': '🇨🇼',
  'costa do marfim': '🇨🇮', 'equador': '🇪🇨', 'holanda': '🇳🇱', 'japão': '🇯🇵',
  'suécia': '🇸🇪', 'tunísia': '🇹🇳', 'bélgica': '🇧🇪', 'egito': '🇪🇬',
  'irã': '🇮🇷', 'nova zelândia': '🇳🇿', 'espanha': '🇪🇸', 'cabo verde': '🇨🇻',
  'arábia saudita': '🇸🇦', 'uruguai': '🇺🇾', 'frança': '🇫🇷', 'senegal': '🇸🇳',
  'iraque': '🇮🇶', 'noruega': '🇳🇴', 'argentina': '🇦🇷', 'argélia': '🇩🇿',
  'áustria': '🇦🇹', 'jordânia': '🇯🇴', 'portugal': '🇵🇹', 'congo': '🇨🇩',
  'uzbequistão': '🇺🇿', 'colômbia': '🇨🇴', 'inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'croácia': '🇭🇷',
  'gana': '🇬🇭', 'panamá': '🇵🇦', 'méxico': '🇲🇽',
  // Inglês (fallback para dados do Supabase)
  'mexico': '🇲🇽', 'south africa': '🇿🇦', 'south korea': '🇰🇷', 'czech republic': '🇨🇿',
  'canada': '🇨🇦', 'bosnia & herzegovina': '🇧🇦', 'qatar': '🇶🇦', 'switzerland': '🇨🇭',
  'brazil': '🇧🇷', 'morocco': '🇲🇦', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'usa': '🇺🇸',
  'paraguay': '🇵🇾', 'australia': '🇦🇺', 'turkey': '🇹🇷', 'germany': '🇩🇪',
  'ivory coast': '🇨🇮', 'ecuador': '🇪🇨', 'netherlands': '🇳🇱', 'japan': '🇯🇵',
  'sweden': '🇸🇪', 'tunisia': '🇹🇳', 'belgium': '🇧🇪', 'egypt': '🇪🇬',
  'iran': '🇮🇷', 'new zealand': '🇳🇿', 'spain': '🇪🇸', 'cape verde': '🇨🇻',
  'saudi arabia': '🇸🇦', 'uruguay': '🇺🇾', 'france': '🇫🇷', 'iraq': '🇮🇶',
  'norway': '🇳🇴', 'algeria': '🇩🇿', 'austria': '🇦🇹', 'jordan': '🇯🇴',
  'dr congo': '🇨🇩', 'uzbekistan': '🇺🇿', 'colombia': '🇨🇴', 'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'croatia': '🇭🇷', 'ghana': '🇬🇭', 'panama': '🇵🇦',
};

const getBandeira = (nome) => BANDEIRAS[nome?.toLowerCase()] || '🏳️';

// Todas as seleções disponíveis para sugestão
const SELECOES = [
  'Argentina', 'Brasil', 'França', 'Inglaterra', 'Alemanha', 'Espanha', 'Portugal',
  'Holanda', 'Bélgica', 'Uruguai', 'Colômbia', 'México', 'Estados Unidos', 'Canadá',
  'Japão', 'Coreia do Sul', 'Marrocos', 'Senegal', 'Egito', 'África do Sul',
  'Austrália', 'Nova Zelândia', 'Suíça', 'Áustria', 'Suécia', 'Noruega',
  'República Tcheca', 'Croácia', 'Escócia', 'Turquia', 'Irã', 'Arábia Saudita',
  'Catar', 'Iraque', 'Jordânia', 'Uzbequistão', 'Congo', 'Argélia', 'Tunísia',
  'Cabo Verde', 'Gana', 'Haiti', 'Panamá', 'Paraguai', 'Equador', 'Costa do Marfim',
  'Curaçao', 'Bósnia e Herzegovina',
];

export default function BuscaScreen() {
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);

  const carregarHistorico = useCallback(async () => {
    const { data, error } = await supabase
      .from('historico_buscas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8);
    if (!error && data) setHistorico(data);
  }, [user.id]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  // Filtra sugestões conforme digita
  useEffect(() => {
    if (busca.length >= 2) {
      const filtradas = SELECOES.filter((s) =>
        s.toLowerCase().includes(busca.toLowerCase())
      );
      setSugestoes(filtradas.slice(0, 5));
    } else {
      setSugestoes([]);
    }
  }, [busca]);

  const salvarHistorico = async (termo) => {
    await supabase.from('historico_buscas').insert({
      user_id: user.id,
      termo,
    });
    carregarHistorico();
  };

  const buscarJogos = async (selecao) => {
    const termo = (selecao || busca).trim();
    if (!termo) {
      Alert.alert('Atenção', 'Digite o nome de uma seleção.');
      return;
    }

    setLoading(true);
    setShowHistorico(false);
    setSugestoes([]);

    // Busca nos campos time_casa e time_fora
    const { data: jogosData, error } = await supabase
      .from('jogos_copa')
      .select('*')
      .or(
        `time_casa.ilike.%${termo}%,time_fora.ilike.%${termo}%,sigla_casa.ilike.%${termo}%,sigla_fora.ilike.%${termo}%`
      )
      .order('data_brasilia', { ascending: true })
      .order('hora_brasilia', { ascending: true });

    if (error) {
      Alert.alert('Erro', 'Não foi possível buscar os jogos.');
    } else {
      setJogos(jogosData || []);
      if ((jogosData || []).length === 0) {
        Alert.alert('Sem resultados', `Nenhum jogo encontrado para "${termo}".`);
      }
    }

    await salvarHistorico(termo);
    setLoading(false);
  };

  const renderJogo = ({ item }) => (
    <View style={styles.jogoCard}>
      <View style={styles.jogoHeader}>
        <Text style={styles.jogoFase}>{item.fase}</Text>
        {item.grupo ? <Text style={styles.jogoGrupo}>Grupo {item.grupo}</Text> : null}
      </View>

      <View style={styles.jogoTeams}>
        <View style={styles.teamBox}>
          <Text style={styles.teamBandeira}>{getBandeira(item.time_casa)}</Text>
          <Text style={styles.teamName} numberOfLines={1}>{item.time_casa}</Text>
          <Text style={styles.teamSigla}>{item.sigla_casa}</Text>
        </View>

        <View style={styles.vsBox}>
          <Text style={styles.vs}>VS</Text>
          <Text style={styles.jogoHora}>{item.hora_brasilia?.slice(0, 5)}</Text>
          <Text style={styles.jogoData}>📅 {formatDate(item.data_brasilia)}</Text>
        </View>

        <View style={styles.teamBox}>
          <Text style={styles.teamBandeira}>{getBandeira(item.time_fora)}</Text>
          <Text style={styles.teamName} numberOfLines={1}>{item.time_fora}</Text>
          <Text style={styles.teamSigla}>{item.sigla_fora}</Text>
        </View>
      </View>

      {item.estadio ? (
        <Text style={styles.estadio}>📍 {item.estadio} — {item.cidade}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Nome da seleção (ex: Brasil)"
          placeholderTextColor="#555"
          value={busca}
          onChangeText={setBusca}
          onFocus={() => setShowHistorico(true)}
          returnKeyType="search"
          onSubmitEditing={() => buscarJogos()}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => buscarJogos()}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Sugestões ao digitar */}
      {sugestoes.length > 0 && (
        <View style={styles.sugestoesBox}>
          {sugestoes.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.sugestaoItem}
              onPress={() => { setBusca(s); buscarJogos(s); }}
            >
              <Text style={styles.sugestaoBandeira}>{getBandeira(s)}</Text>
              <Text style={styles.sugestaoNome}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Histórico */}
      {showHistorico && sugestoes.length === 0 && historico.length > 0 && (
        <View style={styles.historicoBox}>
          <Text style={styles.historicoTitle}>Buscas recentes</Text>
          {historico.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historicoItem}
              onPress={() => { setBusca(item.termo); buscarJogos(item.termo); }}
            >
              <Text style={styles.historicoBandeira}>{getBandeira(item.termo)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historicoTermo}>{item.termo}</Text>
                <Text style={styles.historicoData}>
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </Text>
              </View>
              <Text style={styles.historicoSeta}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Resultados */}
      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jogos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJogo}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>⚽</Text>
              <Text style={styles.emptyText}>
                Busque por uma seleção para ver os jogos
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  input: {
    flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#333',
    borderRadius: 12, color: '#fff', paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#FFD700', borderRadius: 12,
    width: 50, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnText: { fontSize: 20 },

  // Sugestões
  sugestoesBox: {
    backgroundColor: '#111', borderRadius: 12, borderWidth: 1,
    borderColor: '#333', marginBottom: 10, overflow: 'hidden',
  },
  sugestaoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  sugestaoBandeira: { fontSize: 20 },
  sugestaoNome: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Histórico
  historicoBox: {
    backgroundColor: '#111', borderRadius: 12, borderWidth: 1,
    borderColor: '#333', padding: 12, marginBottom: 12,
  },
  historicoTitle: {
    color: '#555', fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  historicoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  historicoBandeira: { fontSize: 20 },
  historicoTermo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  historicoData: { color: '#444', fontSize: 11, marginTop: 2 },
  historicoSeta: { color: '#444', fontSize: 18 },

  // Cards de jogo
  lista: { paddingTop: 8, paddingBottom: 20 },
  jogoCard: {
    backgroundColor: '#111', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e',
  },
  jogoHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  jogoFase: { color: '#555', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  jogoGrupo: {
    color: '#FFD700', fontSize: 11, fontWeight: '700',
    backgroundColor: '#1a1600', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 8,
  },
  jogoTeams: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  teamBox: { flex: 1, alignItems: 'center', gap: 4 },
  teamBandeira: { fontSize: 32 },
  teamName: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  teamSigla: { color: '#FFD700', fontSize: 11, fontWeight: '800' },
  vsBox: { alignItems: 'center', paddingHorizontal: 10 },
  vs: { color: '#333', fontWeight: '900', fontSize: 13, marginBottom: 4 },
  jogoHora: { color: '#FFD700', fontSize: 18, fontWeight: '800' },
  jogoData: { color: '#555', fontSize: 11, marginTop: 2 },
  estadio: { color: '#444', fontSize: 11, textAlign: 'center', marginTop: 4 },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#444', textAlign: 'center', fontSize: 14, lineHeight: 20 },
});