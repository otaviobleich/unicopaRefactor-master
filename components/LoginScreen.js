import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SENHA_MIN = 8;

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
  const erros = [];
  if (senha.length < SENHA_MIN) erros.push(`Mínimo de ${SENHA_MIN} caracteres`);
  if (!/[A-Z]/.test(senha)) erros.push('Pelo menos 1 letra maiúscula');
  if (!/[0-9]/.test(senha)) erros.push('Pelo menos 1 número');
  return erros;
}

function validarUsername(username) {
  if (!username.trim()) return 'Informe um nome de usuário.';
  if (username.trim().length < 3) return 'Mínimo de 3 caracteres.';
  if (username.trim().length > 20) return 'Máximo de 20 caracteres.';
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
    return 'Use apenas letras, números ou _.';
  return '';
}

// Barra de força da senha
function ForcaSenha({ senha }) {
  if (!senha) return null;
  const erros = validarSenha(senha);
  const forca = 3 - erros.length;
  const cores = ['#e74c3c', '#e67e22', '#2ecc71'];
  const labels = ['Fraca', 'Média', 'Forte'];

  return (
    <View style={estilosForca.container}>
      <View style={estilosForca.barras}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              estilosForca.barra,
              { backgroundColor: i < forca ? cores[forca - 1] : '#2a2a2a' },
            ]}
          />
        ))}
      </View>
      <Text style={[estilosForca.label, { color: forca > 0 ? cores[forca - 1] : '#666' }]}>
        {forca > 0 ? labels[forca - 1] : 'Muito fraca'}
      </Text>
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroUsername, setErroUsername] = useState('');
  const [erroGeral, setErroGeral] = useState('');

  const limparErros = () => {
    setErroEmail('');
    setErroSenha('');
    setErroUsername('');
    setErroGeral('');
  };

  const handleSubmit = async () => {
    limparErros();
    let temErro = false;

    if (!email.trim()) {
      setErroEmail('Informe seu e-mail.');
      temErro = true;
    } else if (!validarEmail(email.trim())) {
      setErroEmail('E-mail inválido.');
      temErro = true;
    }

    if (!password) {
      setErroSenha('Informe sua senha.');
      temErro = true;
    } else if (!isLogin) {
      const errosSenha = validarSenha(password);
      if (errosSenha.length > 0) {
        setErroSenha(errosSenha.join(' • '));
        temErro = true;
      }
    }

    // Valida username só no cadastro
    if (!isLogin) {
      const erroU = validarUsername(username);
      if (erroU) {
        setErroUsername(erroU);
        temErro = true;
      }
    }

    if (temErro) return;

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setEmailEnviado(email.trim());
          setAguardandoConfirmacao(true);
        } else if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_credentials')
        ) {
          setErroGeral('E-mail ou senha incorretos. Verifique e tente novamente.');
        } else {
          setErroGeral(error.message);
        }
      }
    } else {
      // Passa o username nos metadados do Supabase
      const { error } = await signUp(email.trim(), password, {
        data: { username: username.trim() },
      });
      if (error) {
        if (error.message.includes('already registered')) {
          setErroEmail('Este e-mail já está cadastrado.');
        } else {
          setErroGeral(error.message);
        }
      } else {
        setEmailEnviado(email.trim());
        setAguardandoConfirmacao(true);
      }
    }

    setLoading(false);
  };

  const handleReenviar = async () => {
    setLoading(true);
    const { error } = await signUp(emailEnviado, password, {
      data: { username: username.trim() },
    });
    if (error && !error.message.includes('already registered')) {
      setErroGeral('Não foi possível reenviar. Tente novamente.');
    }
    setLoading(false);
  };

  // Tela de confirmação de e-mail
  if (aguardandoConfirmacao) {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
          <Image style={styles.logo} source={require('../assets/unicopa.png')} />
          <View style={styles.confirmBox}>
            <Text style={styles.confirmIcon}>✉️</Text>
            <Text style={styles.confirmTitle}>Verifique seu e-mail</Text>
            <Text style={styles.confirmDesc}>Enviamos um link de confirmação para:</Text>
            <Text style={styles.confirmEmail}>{emailEnviado}</Text>
            <Text style={styles.confirmDesc}>
              Clique no link do e-mail e depois volte aqui para entrar.
            </Text>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.button}
              onPress={() => { setAguardandoConfirmacao(false); setIsLogin(true); }}
            >
              <Text style={styles.buttonText}>JÁ CONFIRMEI, ENTRAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reenviarBtn} onPress={handleReenviar} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#FFD700" size="small" />
                : <Text style={styles.reenviarText}>Reenviar e-mail</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setAguardandoConfirmacao(false); setEmail(''); setPassword(''); setUsername(''); }}>
              <Text style={styles.toggle}>Usar outro e-mail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Image style={styles.logo} source={require('../assets/unicopa.png')} />
        <Text style={styles.subtitle}>
          {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
        </Text>

        <View style={styles.card}>

          {erroGeral ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertText}>{erroGeral}</Text>
            </View>
          ) : null}

          {/* Campo username — só no cadastro */}
          {!isLogin && (
            <>
              <Text style={styles.label}>Nome de usuário</Text>
              <TextInput
                style={[styles.input, erroUsername ? styles.inputErro : null]}
                placeholder="ex: craque77"
                placeholderTextColor="#666"
                value={username}
                onChangeText={(v) => { setUsername(v); setErroUsername(''); }}
                autoCapitalize="none"
                maxLength={20}
              />
              {erroUsername
                ? <Text style={styles.erroTexto}>⚠ {erroUsername}</Text>
                : <Text style={styles.dicaTexto}>Letras, números e _ • 3–20 caracteres</Text>
              }
            </>
          )}

          {/* E-mail */}
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, erroEmail ? styles.inputErro : null]}
            placeholder="seu@email.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={(v) => { setEmail(v); setErroEmail(''); setErroGeral(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {erroEmail ? <Text style={styles.erroTexto}>⚠ {erroEmail}</Text> : null}

          {/* Senha */}
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erroSenha ? styles.inputErro : null]}
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={password}
            onChangeText={(v) => { setPassword(v); setErroSenha(''); setErroGeral(''); }}
            secureTextEntry
          />

          {!isLogin && (
            <>
              <ForcaSenha senha={password} />
              <View style={styles.requisitosList}>
                {[
                  { ok: password.length >= SENHA_MIN, texto: `Mínimo ${SENHA_MIN} caracteres` },
                  { ok: /[A-Z]/.test(password), texto: '1 letra maiúscula' },
                  { ok: /[0-9]/.test(password), texto: '1 número' },
                ].map((r) => (
                  <Text key={r.texto} style={[styles.requisito, r.ok ? styles.requisitoOk : styles.requisitoPendente]}>
                    {r.ok ? '✓' : '○'} {r.texto}
                  </Text>
                ))}
              </View>
            </>
          )}

          {erroSenha ? <Text style={styles.erroTexto}>⚠ {erroSenha}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.buttonText}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); limparErros(); }}>
            <Text style={styles.toggle}>
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilosForca = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  barras: { flexDirection: 'row', gap: 4, flex: 1 },
  barra: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 200, height: 55, resizeMode: 'contain', marginBottom: 8 },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 32, letterSpacing: 1, textTransform: 'uppercase' },
  card: { width: '100%', backgroundColor: '#111', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#222' },
  label: { color: '#fff', fontWeight: '600', marginBottom: 6, fontSize: 13, letterSpacing: 0.5, marginTop: 12 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 10, color: '#fff', paddingHorizontal: 14,
    paddingVertical: 12, marginBottom: 4, fontSize: 15,
  },
  inputErro: { borderColor: '#e74c3c' },
  erroTexto: { color: '#e74c3c', fontSize: 12, marginBottom: 8, marginTop: 2 },
  dicaTexto: { color: '#444', fontSize: 11, marginBottom: 8, marginTop: 2 },
  alertBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: '#e74c3c',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  alertIcon: { fontSize: 16 },
  alertText: { color: '#e74c3c', fontSize: 13, flex: 1, lineHeight: 18 },
  requisitosList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  requisito: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  requisitoOk: { color: '#2ecc71', backgroundColor: '#0d2b1a' },
  requisitoPendente: { color: '#666', backgroundColor: '#1a1a1a' },
  button: {
    backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 16, marginBottom: 16,
  },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 1.5 },
  toggle: { color: '#FFD700', textAlign: 'center', fontSize: 13 },
  confirmBox: { width: '100%', backgroundColor: '#111', borderRadius: 16, padding: 28, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  confirmIcon: { fontSize: 48, marginBottom: 16 },
  confirmTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  confirmDesc: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  confirmEmail: { color: '#FFD700', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#222', width: '100%', marginVertical: 20 },
  reenviarBtn: { marginBottom: 16, paddingVertical: 8 },
  reenviarText: { color: '#aaa', fontSize: 13, textDecorationLine: 'underline' },
});