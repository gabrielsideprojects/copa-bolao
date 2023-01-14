import { HStack, useToast, VStack } from "native-base";
import { Share } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { PoolPros} from './../components/PoolCard'
import { Guesses} from './../components/Guesses'

import { api } from './../services/api'
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";

interface RouteParams {
    id: string;
}

export function Details(){
    const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses')
    const [isLoading, setIsLoading] = useState(false)
    const [poolDetails, setPoolDetails] = useState<PoolPros>({} as PoolPros)

    const route = useRoute()
    const { id } = route.params as RouteParams
    const toast = useToast()

    async function handleCodeShare(){
       await Share.share({
            message: poolDetails.code
        })
    }

    async function fetchPoolDetails(){

        try {
            setIsLoading(true)
            const response = await api.get(`/pools/${id}`)
            setPoolDetails(response.data.pool)

        } catch (error) {
            toast.show({
                title: 'Não foi possível carregar os detalhes do bolão',
                placement: 'top',
                bgColor: 'red.300'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(()=>{
        fetchPoolDetails()
    },[id])

    if(isLoading){
        return <Loading/>
    }

    return (
        <VStack flex={1} bgColor={"gray.900"}>
            <Header onShare={handleCodeShare}  title={poolDetails.title} showBackButton showShareButton/> 

            {
                poolDetails._count?.participants > 0 ? <VStack px={5} flex={1}>
                    <PoolHeader data={poolDetails}/>
                    <HStack bgColor={'gray.800'} p={1} rounded={'sm'} mb={5}>
                        <Option title={"Seus palpites"} isSelected={optionSelected === 'guesses'} onPress={()=> setOptionSelected('guesses')}/>
                        <Option title={"Ranking do grupo"} isSelected={optionSelected === 'ranking'} onPress={()=> setOptionSelected('ranking')}/>
                    </HStack>

                    <Guesses code={poolDetails.code} poolId={poolDetails.id}/>
                </VStack> : <EmptyMyPoolList code={poolDetails.code}/>
            }
        </VStack>
    );
}