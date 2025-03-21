import { useQueries, useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { getEvolutionChain, getPokemon, getPokemonSpecies } from "./pokeApi"
import { capitalize } from "lodash-es"
import { Fragment, useContext, useEffect } from "react"
import { PokemonContext } from "./PokemonContext"
import ArrowLeftIcon from "./ArrowLeftIcon"
import { speak } from "./speech"

const getPokemonDesc = (flavour_texts) => {
    for (let i = 0; i < flavour_texts?.length; i++) {
        const { flavor_text, language, version } = flavour_texts[i];
        if (language.name === 'en' && version.name === 'red') {
            return flavor_text;
        }
    }
}

const getEvolutionChainList = (chain) => {
    if (!chain) {
        return
    }

    const name = capitalize(chain.species.name);
    if (chain.evolves_to.length === 0) return [name];
    const nextChain = getEvolutionChainList(chain.evolves_to[0]);
    return [name].concat(nextChain);
};

export const PokemonDetail = () => {
    const { id } = useParams()

    const [{ data }, { data: { species, evolutionChain } = {} as any }] = useQueries({
        queries: [
            {
                queryFn: () => getPokemon(id),
                queryKey: ['getPokemon', id],
                staleTime: Infinity
            },
            {
                queryFn: async () => {
                    const species = await getPokemonSpecies(id)

                    if (species.evolution_chain.url) {
                        const evolutionChain = await getEvolutionChain(species.evolution_chain.url)
                        const chain = getEvolutionChainList(evolutionChain.chain)
                        const evolution = await Promise.all(chain.map(async name => {
                            const result = await getPokemon(name)

                            return { name, image: result.sprites.front_default }
                        }))

                        return { species, evolutionChain: evolution }
                    }

                    return { species }
                },
                queryKey: ['getPokemonSpecies', id],
                staleTime: Infinity
            }
        ]
    })
    const desc = getPokemonDesc(species?.flavor_text_entries)

    useEffect(() => {
        if (desc && data) {
            const types = data.types.map(x => x.type.name)
            const speech = `${data.name} - a ${types.join()} type Pokemon. ${desc}`;
            speak(speech)
        }
    }, [desc, data])

    console.log(data, evolutionChain)

    const weight = Math.round((data?.weight / 4.536) * 10) / 10;
    console.log(evolutionChain)

    return <div id="pokedex">
        <div id="poke-title">
            <Link to="/"><ArrowLeftIcon /></Link>
            <span>
                <span id="poke-name">{capitalize(data?.name)}</span>
                <span id="poke-id">#{data?.id.toString().padStart(3, '0')}</span>
            </span>
        </div>
        <div className="row">
            <div className="column" id="poke-image-container">
                <img id="poke-image" alt={data?.name} src={data?.sprites.other.home.front_default} />
                <div id="poke-typeImages">
                </div>
            </div>
            <div className="column" id="poke-description-container">
                <span id="poke-description">{desc}</span>
                <div className="poke-info">
                    <span className="poke-info-title">Height</span>
                    {data?.height && <span className="poke-info-content" id="poke-height">{`${data?.height / 10}`}
                        <span className="subtext"> m</span>
                    </span>}
                </div>
                <div className="poke-info">
                    <span className="poke-info-title">Weight</span>
                    {data?.weight && <span className="poke-info-content" id="poke-weight">{weight}
                        <span className="subtext"> lbs</span>
                    </span>}
                </div>
                <div className="poke-info">
                    <span className="poke-info-title">Colour</span>
                    <span className="poke-info-content" id="poke-colour">{species?.color?.name}</span>
                </div>
                <div className="poke-info">
                    <span className="poke-info-title">Shape</span>
                    <span className="poke-info-content" id="poke-shape">{species?.shape?.name}</span>
                </div>
                <div className="poke-info">
                    <span className="poke-info-title">Habitat</span>
                    <span className="poke-info-content" id="poke-habitat">{species?.habitat?.name}</span>
                </div>
                <div className="poke-info">
                    <span className="poke-info-title">Abilities</span>
                    <span className="poke-info-content" id="poke-abilities">
                        <ul>
                            {data?.abilities?.map(ab => (<>
                                <li className="tooltip">
                                    <span className="poke-ability">{ab.ability.name}
                                        <span className="subtext">{ab.is_hidden && ' (hidden)'}</span>
                                    </span>
                                </li>
                                <br />
                            </>))}
                        </ul>
                    </span>
                </div>
            </div>
        </div>
        <div className="row">
            <h3 id="poke-evolution-title">Evolution Chart</h3>
            <div id="poke-evolution">
                {
                    evolutionChain?.map((chain, idx) => (
                        <Fragment key={idx}>
                            <Link to={`/${chain.name}`}>
                                <div className="poke-evo-container">
                                    <img className="poke-evo-img" src={chain.image} />
                                    <span className="poke-evo-name">{chain.name}</span>
                                </div>
                            </Link>
                            {idx < evolutionChain.length - 1 && <span className="poke-evo-arrow">→</span>}
                        </Fragment>
                    ))
                }
            </div>
        </div>
    </div>
}