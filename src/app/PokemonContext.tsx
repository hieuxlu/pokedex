import { createContext, useEffect, useState } from "react";
import { fetchModel, predictPokemon } from "./tfUtil";
import { LayersModel } from "@tensorflow/tfjs";
import { initAssets } from "./pokeApi";

export interface IPokemon {
    name: string
    id: number;
    image: string;
    height: string;
    weight: string;
    abilities: string[];
    description: string;
    types
    colour
    shape
    evolution_chain
    habitat
}

export interface IPokemonContextProps {
    prediction?: IPredictionResult;
    image?: string;
    predict: (canvas: HTMLCanvasElement) => Promise<IPredictionResult>
    clearPrediction: () => void;
}

export interface IPredictionResult {
    pred: string;
    topk: IPrediction[]
}

export interface IPrediction {
    conf: number;
    pred: string;
}

const noop = () => {
    // 
}

export const PokemonContext = createContext<IPokemonContextProps>({
    predict: null,
    clearPrediction: noop
})

export const PokemonContextProvider = ({ children }) => {
    const [prediction, setPrediction] = useState<IPredictionResult>()
    const [model, setModel] = useState<LayersModel>();
    const [image, setImage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function doFetchModel() {
            const model = await fetchModel()
            setModel(model)
        }

        async function doInitPokemons() {
            console.log(`[${new Date().toISOString()}] Start loading Pokemons`)
            const result = await initAssets();
            console.log(result);
            setIsLoading(false);
            console.log(`[${new Date().toISOString()}] Finish loading Pokemons`)
        }

        setIsLoading(true);
        doFetchModel();
        doInitPokemons();
    }, [])

    const handlePredict = async (canvas: HTMLCanvasElement) => {
        setImage(canvas.toDataURL())
        const result = await predictPokemon(canvas, model);
        setPrediction(result);

        return result;
    }

    const clearPrediction = () => {
        setPrediction(null)
        setImage(null)
    }

    return <PokemonContext.Provider value={{ prediction, image, predict: handlePredict, clearPrediction }}>{children}</PokemonContext.Provider>
}