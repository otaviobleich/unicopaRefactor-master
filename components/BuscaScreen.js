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

export default function BuscaScreen() {
  const { user } = useAuth();
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);

  
  const carregarHistorico = useCallback(async () => {
    const { data, error } = await supabase
      .from('historico_buscas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) setHistorico(data);
  }, [user.id]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const salvarHistorico = async (termoBusca) => {
    await supabase.from('historico_buscas').insert({
      user_id: user.id,
      termo: termoBusca,
    });
    carregarHistorico();
  };

  const buscarJogos = async (termoBusca) => {
    const termo = (termoBusca || mes).trim();
    if (!termo) {
      Alert.alert('Atenção', 'Digite um mês para buscar (ex: junho ou 06).');
      return;
    }

    setLoading(true);
    setShowHistorico(false);

    
    const mesesMap = {
      janeiro: '01', fevereiro: '02', março: '03', marco: '03',
      abril: '04', maio: '05', junho: '06', julho: '07',
      agosto: '08', setembro: '09', outubro: '10',
      novembro: '11', dezembro: '12',
    };

    let filtroMes = mesesMap[termo.toLowerCase()];
    if (!filtroMes) {
      
      filtroMes = termo.padStart(2, '0');
    }

    
    const { data, error } = await supabase
      .from('jogos_copa')
      .select('*')
      .like('data_brasilia', `%-${filtroMes}-%`)
      .order('data_brasilia', { ascending: true })
      .order('hora_brasilia', { ascending: true });

    if (error) {
      Alert.alert('Erro', 'Não foi possível buscar os jogos.');
    } else {
      setJogos(data || []);
      if ((data || []).length === 0) {
        Alert.alert('Sem jogos', `Nenhum jogo encontrado para "${termo}".`);
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
        <Text style={styles.teamName}>{item.time_casa}</Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.teamName}>{item.time_fora}</Text>
      </View>
      <Text style={styles.jogoInfo}>
        📅 {formatDate(item.data_brasilia)}  🕐 {item.hora_brasilia?.slice(0, 5)}
      </Text>
    </View>
  );

  const renderHistoricoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historicoItem}
      onPress={() => {
        setMes(item.termo);
        buscarJogos(item.termo);
      }}
    >
      <Text style={styles.historicoIcon}>🔍</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.historicoTermo}>{item.termo}</Text>
        <Text style={styles.historicoData}>
          {new Date(item.created_at).toLocaleString('pt-BR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Mês (ex: junho ou 06)"
          placeholderTextColor="#666"
          value={mes}
          onChangeText={setMes}
          onFocus={() => setShowHistorico(true)}
          returnKeyType="search"
          onSubmitEditing={() => buscarJogos()}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => buscarJogos()}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {}
      {showHistorico && historico.length > 0 && (
        <View style={styles.historicoBox}>
          <Text style={styles.historicoTitle}>Buscas recentes</Text>
          <FlatList
            data={historico}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoricoItem}
            scrollEnabled={false}
          />
        </View>
      )}

      {}
      {loading ? (
        <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jogos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJogo}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Busque por um mês para ver os jogos
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 20,
  },
  historicoBox: {
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    marginBottom: 12,
  },
  historicoTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  historicoIcon: {
    fontSize: 14,
  },
  historicoTermo: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  historicoData: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  lista: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  jogoCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  jogoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  jogoFase: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jogoGrupo: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
  },
  jogoTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  teamName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 13,
  },
  jogoInfo: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: '#444',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 14,
  },
});