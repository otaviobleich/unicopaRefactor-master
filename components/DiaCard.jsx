import { View, Text, Image, StyleSheet } from 'react-native';
import { getBandeira } from '../assets/mapaBandeiras';

const formatarData = (dataISO) => {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}`;
};

export default function DiaCard({ data, jogos }) {

  return (
    <View style={styles.card}>

      <Text style={styles.data}>
        {formatarData(data)}
      </Text>

      {jogos.map((jogo, index) => {

        const ehBrasil =
          jogo.sigla_casa === 'BRA' ||
          jogo.sigla_fora === 'BRA' ||
          jogo.time_casa === 'Brasil' ||
          jogo.time_fora === 'Brasil';

        const bandeiraCasa = getBandeira(jogo.sigla_casa);
        const bandeiraFora = getBandeira(jogo.sigla_fora);

        return (
          <View
            key={index}
            style={[
              styles.jogo,
              ehBrasil && styles.jogoBrasil
            ]}
          >

            <View style={styles.linhaPrincipal}>

              
              <View style={styles.timeContainer}>
                {bandeiraCasa && (
                  <Image source={bandeiraCasa} style={styles.bandeira} />
                )}
                <Text style={styles.time}>{jogo.sigla_casa}</Text>
              </View>

              
              <Text style={styles.hora}>
                {jogo.hora_brasilia || 'A definir'}
              </Text>

              
              <View style={[styles.timeContainer, styles.timeContainerDireita]}>
                <Text style={styles.time}>{jogo.sigla_fora}</Text>
                {bandeiraFora && (
                  <Image source={bandeiraFora} style={styles.bandeira} />
                )}
              </View>

            </View>

          </View>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },

  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d3d',
    paddingBottom: 15,
  },

  jogoBrasil: {
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
    backgroundColor: '#0f2a1f',
    shadowColor: '#00ff88',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    paddingLeft: 8,
  },

  linhaPrincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  timeContainerDireita: {
    justifyContent: 'flex-end',
  },

  bandeira: {
    width: 28,
    height: 20,
    resizeMode: 'contain',
  },

  time: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  hora: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
});