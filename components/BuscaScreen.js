import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import dados from '../assets/dados.json';
import DiaCard from './DiaCard';

// Remove acentos e coloca em minúsculo para comparação
function normalizar(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function BuscaScreen() {
  const [query, setQuery] = useState('');

  // Filtra jogos onde time_casa, sigla_casa, time_fora ou sigla_fora batem com a busca
  const jogosEncontrados = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return [];

    return dados.jogos.filter((jogo) =>
      normalizar(jogo.time_casa).includes(q) ||
      normalizar(jogo.sigla_casa).includes(q) ||
      normalizar(jogo.time_fora).includes(q) ||
      normalizar(jogo.sigla_fora).includes(q)
    );
  }, [query]);

  // Agrupa por data (igual ao CalendarioScreen) para passar pro DiaCard
  const jogosAgrupados = useMemo(() => {
    const agrupado = jogosEncontrados.reduce((acc, jogo) => {
      const data = jogo.data_brasilia;
      if (!acc[data]) acc[data] = [];
      acc[data].push(jogo);
      return acc;
    }, {});

    // Ordena por hora dentro de cada dia
    Object.keys(agrupado).forEach((data) => {
      agrupado[data].sort((a, b) =>
        a.hora_brasilia.localeCompare(b.hora_brasilia)
      );
    });

    return agrupado;
  }, [jogosEncontrados]);

  return (
    <View style={styles.container}>
      {/* Campo de busca */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Brasil, ARG, França..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Resultados */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim() === '' && (
          <Text style={styles.hint}>
            Digite o nome ou sigla de uma seleção para ver os jogos dela.
          </Text>
        )}

        {query.trim() !== '' && jogosEncontrados.length === 0 && (
          <Text style={styles.hint}>
            Nenhum jogo encontrado para "{query}".
          </Text>
        )}

        {jogosEncontrados.length > 0 && (
          <>
            <Text style={styles.resultado}>
              {jogosEncontrados.length}{' '}
              {jogosEncontrados.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
            </Text>

            {/* Reutiliza exatamente o DiaCard do Calendário */}
            {Object.entries(jogosAgrupados).map(([data, jogosDoDia]) => (
              <DiaCard key={data} data={data} jogos={jogosDoDia} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 12,
  },
  clearBtn: { color: '#555', fontSize: 16, paddingHorizontal: 4 },

  scroll: { alignItems: 'center', paddingBottom: 40 },

  hint: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
    paddingHorizontal: 32,
  },

  resultado: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
});