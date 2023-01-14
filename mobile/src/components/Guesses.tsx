import {  useToast, FlatList } from 'native-base';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Game, GameProps } from '../components/Game'
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';


interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const [firstTeamPoints, setFirstTeamPoints] = useState('')
  const [secondTeamPoints, setSecondTeamPoints] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [games,setGames] = useState<GameProps[]>([])
  const toast = useToast()

  async function fetchGames(){
    try {
      setIsLoading(true)
      const response = await api.get(`/pools/${poolId}/games`);
      setGames(response.data.games)
    } catch (error) {
      console.log(error)
      toast.show({
          title: 'Não foi possível carregar os detalhes do jogo',
          placement: 'top',
          bgColor: 'red.300'
      })
  } finally {
      setIsLoading(false)
  }
  }

  async function handleGuessConfirm(gameId: string){
    try {
      if(!firstTeamPoints.trim() || !secondTeamPoints.trim()){
        return toast.show({
          title: 'Infome para o placar do palpite',
          placement: 'top',
          bgColor: 'red.300'
      })
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints:Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints)
      })
       toast.show({
        title: 'Palpite realizado com sucesso',
        placement: 'top',
        bgColor: 'green.300'
     })
    fetchGames()
    } catch (error) {
      console.log(error)
      toast.show({
          title: 'Não foi possível enviar o palpite',
          placement: 'top',
          bgColor: 'red.300'
      })
  } finally {
      setIsLoading(false)
  }
  }
  useEffect(()=>{
    fetchGames()
  },[poolId])


  if(isLoading) {
    return <Loading/>
  }

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({item})=> (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          onGuessConfirm={()=> handleGuessConfirm(item.id) } 
          setSecondTeamPoints={setSecondTeamPoints}        
          />
      )}
      ListEmptyComponent={()=> <EmptyMyPoolList code={code}/>}
    />
  );
}
