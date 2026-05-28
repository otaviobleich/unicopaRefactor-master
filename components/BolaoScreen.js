

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import dados from '../assets/dados.json';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MULTIPLICADOR = { exato: 3, vencedor: 2, erro: 0 };

function avaliarPalpite(palpite, resultado) {
  if (!resultado) return null;
  if (palpite.gols_casa === resultado.gols_casa && palpite.gols_fora === resultado.gols_fora)
    return 'exato';
  const vP = Math.sign(palpite.gols_casa - palpite.gols_fora);
  const vR = Math.sign(resultado.gols_casa - resultado.gols_fora);
  return vP === vR ? 'vencedor' : 'erro';
}

// ─── Tela de entrada ──────────────────────────────────────────────────────────

function TelaEntrada({ onCriar, onEntrar }) {
  const [nomeBolao, setNomeBolao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCriar = async () => {
    if (!nomeBolao.trim()) return Alert.alert('Atenção', 'Digite um nome para o bolão.');
    setLoading(true);
    await onCriar(nomeBolao.trim());
    setLoading(false);
  };

  const handleEntrar = async () => {
    if (!codigo.trim()) return Alert.alert('Atenção', 'Digite o código do bolão.');
    setLoading(true);
    await onEntrar(codigo.trim().toUpperCase());
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.entrada}>
      <Text style={styles.tituloPag}>🎯 Bolão UniCoins</Text>
      <Text style={styles.subtituloPag}>
        Faça seus palpites e dispute com os amigos!
      </Text>

      {/* Regras */}
      <View style={styles.regrasBox}>
        <Text style={styles.regrasTitle}>Como funciona</Text>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>🪙</Text>
          <Text style={styles.regraTexto}>Você começa com <Text style={styles.gold}>100 UniCoins</Text></Text>
        </View>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>🎰</Text>
          <Text style={styles.regraTexto}>Aposte de <Text style={styles.gold}>1 a 20 UniCoins</Text> por jogo</Text>
        </View>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>🏆</Text>
          <Text style={styles.regraTexto}>Placar exato → ganha <Text style={styles.gold}>3×</Text> a aposta</Text>
        </View>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>✅</Text>
          <Text style={styles.regraTexto}>Acertou o vencedor → ganha <Text style={styles.gold}>2×</Text></Text>
        </View>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>❌</Text>
          <Text style={styles.regraTexto}>Errou → perde o que apostou</Text>
        </View>
        <View style={styles.regraRow}>
          <Text style={styles.regraEmoji}>📊</Text>
          <Text style={styles.regraTexto}>Ranking por UniCoins no final</Text>
        </View>
      </View>

      {modo === null && (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btnPrimario, { flex: 1 }]} onPress={() => setModo('criar')}>
            <Text style={styles.btnPrimarioText}>+ Criar Bolão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSecundario, { flex: 1 }]} onPress={() => setModo('entrar')}>
            <Text style={styles.btnSecundarioText}>Entrar com código</Text>
          </TouchableOpacity>
        </View>
      )}

      {modo === 'criar' && (
        <View style={styles.formBox}>
          <Text style={styles.formLabel}>Nome do bolão</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Ex: Copa dos Chegados"
            placeholderTextColor="#444"
            value={nomeBolao}
            onChangeText={setNomeBolao}
            maxLength={40}
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnSecundario, { flex: 1 }]} onPress={() => setModo(null)}>
              <Text style={styles.btnSecundarioText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnPrimario, { flex: 2 }]} onPress={handleCriar} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimarioText}>Criar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {modo === 'entrar' && (
        <View style={styles.formBox}>
          <Text style={styles.formLabel}>Código do bolão</Text>
          <TextInput
            style={[styles.formInput, { letterSpacing: 6, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#FFD700' }]}
            placeholder="ABC123"
            placeholderTextColor="#333"
            value={codigo}
            onChangeText={setCodigo}
            maxLength={6}
            autoCapitalize="characters"
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnSecundario, { flex: 1 }]} onPress={() => setModo(null)}>
              <Text style={styles.btnSecundarioText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnPrimario, { flex: 2 }]} onPress={handleEntrar} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimarioText}>Entrar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Modal de palpite ─────────────────────────────────────────────────────────

function ModalPalpite({ jogo, palpiteAtual, saldoAtual, onSalvar, onFechar }) {
  const [gCasa, setGCasa] = useState(String(palpiteAtual?.gols_casa ?? 0));
  const [gFora, setGFora] = useState(String(palpiteAtual?.gols_fora ?? 0));
  const [aposta, setAposta] = useState(String(palpiteAtual?.aposta_unicoins ?? 5));

  const apostaNum = Math.min(20, Math.max(1, parseInt(aposta) || 1));
  // Saldo disponível considera o que já estava apostado nesse jogo (pode reaproveitá-lo)
  const saldoDisponivel = saldoAtual + (palpiteAtual?.aposta_unicoins ?? 0);

  const ajustar = (setter, valor, delta) => {
    setter(String(Math.max(0, (parseInt(valor) || 0) + delta)));
  };

  const ajustarAposta = (delta) => {
    const novo = Math.min(20, Math.max(1, apostaNum + delta));
    setAposta(String(novo));
  };

  const podeSalvar = apostaNum <= saldoDisponivel && apostaNum >= 1;

  return (
    <Modal transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitulo}>Seu palpite</Text>
          <Text style={styles.modalJogo}>{jogo.time_casa}  ×  {jogo.time_fora}</Text>
          <Text style={styles.modalData}>{jogo.data_brasilia} · {jogo.hora_brasilia}</Text>

          {/* Placar */}
          <View style={styles.placarInput}>
            <View style={styles.golBox}>
              <Text style={styles.timeNome} numberOfLines={1}>{jogo.sigla_casa}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => ajustar(setGCasa, gCasa, -1)}>
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.gol}>{gCasa}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => ajustar(setGCasa, gCasa, +1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.x}>×</Text>
            <View style={styles.golBox}>
              <Text style={styles.timeNome} numberOfLines={1}>{jogo.sigla_fora}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => ajustar(setGFora, gFora, -1)}>
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.gol}>{gFora}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => ajustar(setGFora, gFora, +1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Aposta de UniCoins */}
          <View style={styles.apostaBox}>
            <Text style={styles.apostaLabel}>🪙 UniCoins a apostar</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => ajustarAposta(-1)}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.gol, { color: '#FFD700', minWidth: 44 }]}>{apostaNum}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => ajustarAposta(+1)}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.apostaInfo}>
              Saldo disponível: <Text style={{ color: '#FFD700', fontWeight: '700' }}>{saldoDisponivel} 🪙</Text>
            </Text>
            <Text style={styles.apostaInfo}>
              Se acertar o placar: <Text style={{ color: '#2ecc71', fontWeight: '700' }}>+{apostaNum * MULTIPLICADOR.exato} 🪙</Text>
              {' '}· vencedor: <Text style={{ color: '#f39c12', fontWeight: '700' }}>+{apostaNum * MULTIPLICADOR.vencedor} 🪙</Text>
            </Text>
            {!podeSalvar && (
              <Text style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>
                Saldo insuficiente para essa aposta.
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnSecundario, { flex: 1 }]} onPress={onFechar}>
              <Text style={styles.btnSecundarioText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimario, { flex: 2, opacity: podeSalvar ? 1 : 0.4 }]}
              onPress={() => podeSalvar && onSalvar(parseInt(gCasa) || 0, parseInt(gFora) || 0, apostaNum)}
              disabled={!podeSalvar}
            >
              <Text style={styles.btnPrimarioText}>Salvar palpite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Tela principal do bolão ──────────────────────────────────────────────────

function TelaBolao({ bolao, onSair }) {
  const { user } = useAuth();
  const [aba, setAba] = useState('palpites');
  const [membros, setMembros] = useState([]);
  const [meuMembro, setMeuMembro] = useState(null);
  const [meusPalpites, setMeusPalpites] = useState({});
  const [todosPalpites, setTodosPalpites] = useState([]);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Em produção: preencha com resultados reais quando os jogos terminarem
  // Ex: { '1': { gols_casa: 2, gols_fora: 1 }, '2': { gols_casa: 0, gols_fora: 0 } }
  const resultados = {};

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const { data: membrosData } = await supabase
        .from('bolao_membros')
        .select('*')
        .eq('bolao_id', bolao.id);
      setMembros(membrosData ?? []);

      const eu = (membrosData ?? []).find((m) => m.user_id === user.id);
      setMeuMembro(eu ?? null);

      const { data: palpitesData } = await supabase
        .from('palpites')
        .select('*')
        .eq('bolao_id', bolao.id);
      setTodosPalpites(palpitesData ?? []);

      const mapa = {};
      (palpitesData ?? [])
        .filter((p) => p.user_id === user.id)
        .forEach((p) => { mapa[p.jogo_id] = p; });
      setMeusPalpites(mapa);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [bolao.id, user.id]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const salvarPalpite = async (gCasa, gFora, apostaCoin) => {
    const jogoId = String(jogoSelecionado.id);
    const existente = meusPalpites[jogoId];
    const apostaAnterior = existente?.aposta_unicoins ?? 0;
    const diferenca = apostaCoin - apostaAnterior; // pode ser negativo (diminuiu a aposta)
    const novoSaldo = (meuMembro?.unicoins ?? 100) - diferenca;

    if (novoSaldo < 0) {
      Alert.alert('Saldo insuficiente', 'Você não tem UniCoins suficientes para essa aposta.');
      return;
    }

    try {
      if (existente) {
        await supabase
          .from('palpites')
          .update({ gols_casa: gCasa, gols_fora: gFora, aposta_unicoins: apostaCoin })
          .eq('id', existente.id);
      } else {
        await supabase.from('palpites').insert({
          bolao_id: bolao.id,
          user_id: user.id,
          jogo_id: jogoId,
          gols_casa: gCasa,
          gols_fora: gFora,
          aposta_unicoins: apostaCoin,
        });
      }

      // Atualiza saldo do membro
      await supabase
        .from('bolao_membros')
        .update({ unicoins: novoSaldo })
        .eq('id', meuMembro.id);

      setJogoSelecionado(null);
      await carregarDados();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o palpite.');
    }
  };

  // Ranking: saldo atual de unicoins + palpites resolvidos
  const ranking = membros
    .map((m) => {
      const palpitesMembro = todosPalpites.filter((p) => p.user_id === m.user_id);
      let ganhos = 0;
      palpitesMembro.forEach((p) => {
        const avaliacao = avaliarPalpite(p, resultados[p.jogo_id]);
        if (avaliacao) {
          ganhos += p.aposta_unicoins * MULTIPLICADOR[avaliacao];
        }
      });
      return {
        username: m.username || 'Anônimo',
        unicoins: m.unicoins,
        palpites: palpitesMembro.length,
        ganhos,
        isMe: m.user_id === user.id,
      };
    })
    .sort((a, b) => b.unicoins - a.unicoins);

  const jogos = dados.jogos ?? [];
  const saldoAtual = meuMembro?.unicoins ?? 100;

  return (
    <View style={{ flex: 1 }}>
      {/* Header do bolão */}
      <View style={styles.bolaoHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bolaoNome}>{bolao.nome}</Text>
          <Text style={styles.bolaoCodigo}>
            Código: <Text style={{ color: '#FFD700', letterSpacing: 2, fontWeight: '800' }}>{bolao.codigo}</Text>
          </Text>
        </View>
        <View style={styles.saldoChip}>
          <Text style={styles.saldoNum}>{saldoAtual}</Text>
          <Text style={styles.saldoLabel}>🪙</Text>
        </View>
        <TouchableOpacity onPress={onSair} style={styles.sairBtn}>
          <Text style={styles.sairBtnText}>Trocar</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-abas */}
      <View style={styles.subTabs}>
        {[
          { key: 'palpites', label: '✏️ Palpites' },
          { key: 'ranking',  label: '🏅 Ranking'  },
          { key: 'membros',  label: '👥 Membros'  },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.subTab, aba === t.key && styles.subTabActive]}
            onPress={() => setAba(t.key)}
          >
            <Text style={[styles.subTabText, aba === t.key && styles.subTabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#FFD700" size="large" />
        </View>
      ) : (
        <>
          {/* ── Aba Palpites ── */}
          {aba === 'palpites' && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              <Text style={styles.secaoTitulo}>Toque em um jogo para apostar</Text>
              {jogos.map((jogo) => {
                const jogoId = String(jogo.id);
                const palpite = meusPalpites[jogoId];
                return (
                  <TouchableOpacity
                    key={jogoId}
                    style={[styles.jogoItem, palpite && styles.jogoItemPalpitado]}
                    onPress={() => setJogoSelecionado(jogo)}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jogoData}>
                        {jogo.data_brasilia} · {jogo.hora_brasilia}
                      </Text>
                      <Text style={styles.jogoTimes}>
                        {jogo.sigla_casa}  ×  {jogo.sigla_fora}
                      </Text>
                      <Text style={styles.jogoNomeTimes} numberOfLines={1}>
                        {jogo.time_casa} × {jogo.time_fora}
                      </Text>
                    </View>
                    {palpite ? (
                      <View style={styles.palpiteBadge}>
                        <Text style={styles.palpiteTexto}>
                          {palpite.gols_casa}–{palpite.gols_fora}
                        </Text>
                        <Text style={styles.palpiteCoins}>🪙 {palpite.aposta_unicoins}</Text>
                      </View>
                    ) : (
                      <Text style={styles.semPalpite}>+ Apostar</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ── Aba Ranking ── */}
          {aba === 'ranking' && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {Object.keys(resultados).length === 0 && (
                <View style={styles.avisoBox}>
                  <Text style={styles.avisoTexto}>
                    💡 Os UniCoins serão atualizados automaticamente conforme os jogos terminarem.
                    Por enquanto o ranking mostra o saldo disponível de cada um.
                  </Text>
                </View>
              )}
              {ranking.map((m, idx) => (
                <View key={m.username + idx} style={[styles.rankRow, m.isMe && styles.rankRowMe]}>
                  <Text style={styles.rankPos}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankNome}>
                      {m.username}{m.isMe ? '  (você)' : ''}
                    </Text>
                    <Text style={styles.rankDetalhe}>{m.palpites} palpite{m.palpites !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.rankCoinBox}>
                    <Text style={styles.rankCoins}>{m.unicoins}</Text>
                    <Text style={styles.rankCoinLabel}>🪙</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* ── Aba Membros ── */}
          {aba === 'membros' && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              <View style={styles.codigoCard}>
                <Text style={styles.codigoCardLabel}>Compartilhe o código com seus amigos</Text>
                <Text style={styles.codigoCardCodigo}>{bolao.codigo}</Text>
                <Text style={styles.codigoCardDica}>Eles entram em 🎯 Bolão → "Entrar com código"</Text>
              </View>
              <Text style={styles.secaoTitulo}>{membros.length} membro{membros.length !== 1 ? 's' : ''}</Text>
              {membros.map((m) => (
                <View key={m.id} style={styles.membroRow}>
                  <Text style={styles.membroEmoji}>
                    {m.user_id === bolao.criado_por ? '👑' : '🙂'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.membroNome}>
                      {m.username || 'Anônimo'}
                      {m.user_id === user.id ? '  (você)' : ''}
                    </Text>
                    {m.user_id === bolao.criado_por && (
                      <Text style={styles.membroCriador}>Criador do bolão</Text>
                    )}
                  </View>
                  <Text style={styles.membroCoins}>{m.unicoins} 🪙</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Modal de palpite */}
      {jogoSelecionado && meuMembro && (
        <ModalPalpite
          jogo={jogoSelecionado}
          palpiteAtual={meusPalpites[String(jogoSelecionado.id)]}
          saldoAtual={saldoAtual}
          onSalvar={salvarPalpite}
          onFechar={() => setJogoSelecionado(null)}
        />
      )}
    </View>
  );
}

// ─── BolaoScreen (raiz) ────────────────────────────────────────────────────────

export default function BolaoScreen() {
  const { user } = useAuth();
  const [bolao, setBolao] = useState(null);
  const [loading, setLoading] = useState(true);

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuário';

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('bolao_membros')
          .select('bolao_id, boloes(*)')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        if (data?.boloes) setBolao(data.boloes);
      } catch { /* sem bolão ainda */ }
      setLoading(false);
    })();
  }, [user.id]);

  const criarBolao = async (nome) => {
    const codigo = gerarCodigo();
    try {
      const { data: novoBolao, error } = await supabase
        .from('boloes')
        .insert({ nome, codigo, criado_por: user.id })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('bolao_membros').insert({
        bolao_id: novoBolao.id,
        user_id: user.id,
        username,
        unicoins: 100,
      });
      setBolao(novoBolao);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o bolão. Verifique se as tabelas foram criadas no Supabase.');
    }
  };

  const entrarBolao = async (codigo) => {
    try {
      const { data: bolaoEncontrado, error } = await supabase
        .from('boloes')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error || !bolaoEncontrado)
        return Alert.alert('Código inválido', 'Nenhum bolão encontrado com esse código.');

      await supabase.from('bolao_membros').upsert(
        { bolao_id: bolaoEncontrado.id, user_id: user.id, username, unicoins: 100 },
        { onConflict: 'bolao_id,user_id' }
      );
      setBolao(bolaoEncontrado);
    } catch {
      Alert.alert('Erro', 'Não foi possível entrar no bolão.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  if (!bolao) return <TelaEntrada onCriar={criarBolao} onEntrar={entrarBolao} />;
  return <TelaBolao bolao={bolao} onSair={() => setBolao(null)} />;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gold: { color: '#FFD700' },

  // Entrada
  entrada: { padding: 20, paddingBottom: 60 },
  tituloPag: { color: '#FFD700', fontSize: 30, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  subtituloPag: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20, lineHeight: 20 },

  regrasBox: {
    backgroundColor: '#0d1f0d', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#1a3a1a', marginBottom: 24,
  },
  regrasTitle: { color: '#2ecc71', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  regraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  regraEmoji: { fontSize: 16, width: 28 },
  regraTexto: { color: '#aaa', fontSize: 13, flex: 1, lineHeight: 20 },

  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btnPrimario: { backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimarioText: { color: '#000', fontWeight: '800', fontSize: 15 },
  btnSecundario: { backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  btnSecundarioText: { color: '#aaa', fontWeight: '600', fontSize: 15 },

  formBox: { marginTop: 8 },
  formLabel: { color: '#aaa', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  formInput: { backgroundColor: '#111', borderRadius: 12, color: '#fff', fontSize: 16, padding: 14, borderWidth: 1, borderColor: '#333', marginBottom: 4 },

  // Header do bolão
  bolaoHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderColor: '#1a1a1a',
    gap: 10,
  },
  bolaoNome: { color: '#fff', fontSize: 15, fontWeight: '800' },
  bolaoCodigo: { color: '#444', fontSize: 12, marginTop: 2 },
  saldoChip: {
    backgroundColor: '#1a1a00', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FFD70044', flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  saldoNum: { color: '#FFD700', fontWeight: '900', fontSize: 16 },
  saldoLabel: { fontSize: 14 },
  sairBtn: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#333' },
  sairBtnText: { color: '#aaa', fontSize: 12, fontWeight: '600' },

  // Sub-abas
  subTabs: {
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 10,
    backgroundColor: '#111', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#222',
  },
  subTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  subTabActive: { backgroundColor: '#FFD700' },
  subTabText: { color: '#555', fontWeight: '600', fontSize: 12 },
  subTabTextActive: { color: '#000', fontWeight: '800' },

  secaoTitulo: { color: '#444', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  avisoBox: { backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  avisoTexto: { color: '#666', fontSize: 13, lineHeight: 20 },

  // Jogos
  jogoItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111',
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e',
  },
  jogoItemPalpitado: { borderColor: '#FFD70033', backgroundColor: '#111100' },
  jogoData: { color: '#444', fontSize: 10, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  jogoTimes: { color: '#fff', fontSize: 15, fontWeight: '800' },
  jogoNomeTimes: { color: '#444', fontSize: 11, marginTop: 2 },

  palpiteBadge: {
    backgroundColor: '#1a1a00', borderRadius: 10, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD70044', minWidth: 56,
  },
  palpiteTexto: { color: '#FFD700', fontWeight: '900', fontSize: 16 },
  palpiteCoins: { color: '#888', fontSize: 11, marginTop: 2 },
  semPalpite: { color: '#2a2a2a', fontSize: 13, fontWeight: '700' },

  // Ranking
  rankRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111',
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1e1e1e', gap: 10,
  },
  rankRowMe: { borderColor: '#FFD70044', backgroundColor: '#111100' },
  rankPos: { fontSize: 20, width: 32 },
  rankNome: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rankDetalhe: { color: '#444', fontSize: 11, marginTop: 2 },
  rankCoinBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankCoins: { color: '#FFD700', fontWeight: '900', fontSize: 20 },
  rankCoinLabel: { fontSize: 16 },

  // Membros
  codigoCard: {
    backgroundColor: '#0d1f0d', borderRadius: 14, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#1a3a1a', alignItems: 'center',
  },
  codigoCardLabel: { color: '#555', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  codigoCardCodigo: { color: '#FFD700', fontSize: 36, fontWeight: '900', letterSpacing: 8 },
  codigoCardDica: { color: '#444', fontSize: 11, marginTop: 10, textAlign: 'center' },
  membroRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#1a1a1a', gap: 10,
  },
  membroEmoji: { fontSize: 20 },
  membroNome: { color: '#fff', fontSize: 14, fontWeight: '600' },
  membroCriador: { color: '#FFD700', fontSize: 11, marginTop: 2 },
  membroCoins: { color: '#FFD700', fontWeight: '700', fontSize: 14 },

  // Modal
  overlay: { flex: 1, backgroundColor: '#000000dd', justifyContent: 'center', alignItems: 'center' },
  modal: {
    backgroundColor: '#111', borderRadius: 20, padding: 24,
    width: '90%', borderWidth: 1, borderColor: '#2a2a2a',
  },
  modalTitulo: { color: '#FFD700', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  modalJogo: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  modalData: { color: '#444', fontSize: 12, textAlign: 'center', marginBottom: 20, marginTop: 4 },

  placarInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  golBox: { alignItems: 'center', flex: 1 },
  timeNome: { color: '#aaa', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    backgroundColor: '#1a1a1a', borderRadius: 8, width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333',
  },
  stepBtnText: { color: '#FFD700', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  gol: { color: '#fff', fontSize: 30, fontWeight: '900', minWidth: 30, textAlign: 'center' },
  x: { color: '#333', fontSize: 20, fontWeight: '700', marginHorizontal: 6 },

  apostaBox: {
    backgroundColor: '#0a0a0a', borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#1a1a1a', alignItems: 'center',
  },
  apostaLabel: { color: '#aaa', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  apostaInfo: { color: '#555', fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18 },
});