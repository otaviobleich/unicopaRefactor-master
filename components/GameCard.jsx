export default function GameCard({game}) {

return(
    <View style={styles.jogo}>
    
              <Text style={styles.grupo}>
                GRUPO {game.grupo}  {game.confronto}
              </Text>
    
              <View style={styles.linhaPrincipal}>
    
                <View style={styles.time}>
                  <Image
                    style={styles.bandeira}
                    source={require('./assets/jogos/mexico.png')}
                  />
                  <Text style={styles.sigla}>{game.sigla_casa}</Text>
                </View>
    
                <View style={styles.horario}>
                  <Text style={styles.hora}>{jogos[0].hora_brasilia}</Text>
                  <Text style={styles.subTitulo}>VS</Text>
                </View>
    
                <View style={styles.time}>
                  <Text style={styles.sigla}>{jogos[0].sigla_fora}</Text>
                  <Image
                    style={styles.bandeira}
                    source={require('./assets/jogos/south africa.png')}
                  />
                </View>
    
              </View>
    
              <View style={styles.local}>
                <Text style={styles.subTitulo}>{jogos[0].estadio}</Text>
                <Text style={styles.subTitulo}>
                  {jogos[0].cidade} • {jogos[0].pais}
                </Text>

                <GameCard game={(jogos[0])}/>
                <GameCard game={(jogos[0])}/>

                
                

              </View>
    
            </View>
);

}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#040b13',
    alignItems: 'center',
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: 'contain'
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
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
    marginBottom: 10
  },

  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d3d',
    paddingBottom: 15
  },
  grupo: {
    color: '#8fa3b8',
    fontSize: 12,
    marginBottom: 10
  },
  linhaPrincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  sigla: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  horario: {
    alignItems: 'center'
  },
  hora: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  local: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subTitulo: {
    color: '#8fa3b8',
    fontSize: 12
  }
});