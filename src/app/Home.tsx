import { LayersModel } from "@tensorflow/tfjs";
import { useState, useContext, useEffect, ChangeEvent } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import CameraIcon from "./CameraIcon";
import CropIcon from "./CropIcon";
import { readAsUrlAsync, getCroppedImg } from "./fileUtil";
import { PokemonContext } from "./PokemonContext";
import { fetchModel, predictPokemon } from "./tfUtil";
import styled from "@emotion/styled";
import { capitalize } from "lodash-es";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { speak } from "./speech";

const StyledHiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const StyledHome = styled.div`
    #poke-image-container {
        .bi-camera {
            font-size: 40px;
            color: #bbb;
        }

        .camera-input {
            position: absolute;
            display: flex;

            &.is-empty {
                width: 100%;
                height: 100%;
                align-items: center;
                justify-content: center;
                top: 0;
                left: 0;

                .bi-camera {
                    font-size: 60px;
                }
            }
        }
    }
`

export const Home = () => {
    const [imageEle, setImageEle] = useState(null);
    const [dataUrl, setDataUrl] = useState('')
    const [crop, setCrop] = useState<Crop>({
        unit: '%', // Can be 'px' or '%'
        x: 25,
        y: 25,
        width: 50,
        height: 50
    })
    const { predict, prediction, image, clearPrediction } = useContext(PokemonContext)
    const [croppedImage, setCroppedImage] = useState(image)

    const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) {
            return;
        }

        console.log(e.target.files)
        const dataUrl = await readAsUrlAsync(e.target.files[0])
        setCroppedImage(null)
        clearPrediction()
        setDataUrl(dataUrl)
    }

    const onImageLoad = (e) => {
        setImageEle(e.currentTarget);
    };

    const isCropping = !croppedImage && dataUrl
    const isEmpty = !dataUrl && !croppedImage

    const handleCrop = async () => {
        if (prediction || !imageEle) {
            return
        }
        
        const { base64Image, canvas } = getCroppedImg(imageEle, crop);
        setDataUrl(null)
        setCroppedImage(base64Image)
        const result = await predict(canvas);
        const percent = Math.round(result.topk[0].conf * 100);
        speak(`This pokemon looks like ${result.pred} with ${percent} percent confidence`)
    }

    return <StyledHome>
        <div id="pokedex">
            <div className="row">
                <div className="column" id="poke-image-container">
                    {!isCropping && <div className={classNames("camera-input", {
                        'is-empty': isEmpty
                    })}>
                        <CameraIcon />
                        <StyledHiddenInput onChange={onChange} type="file" accept="image/*" capture="environment" />
                    </div>}
                    {croppedImage && <div>
                        <img id="poke-image" src={croppedImage} alt='Pokemon' />
                    </div>}
                    {dataUrl && <div>
                        <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                            <img src={dataUrl} onLoad={onImageLoad} alt='Pokemon' />
                        </ReactCrop>
                    </div>}
                </div>
            </div>
        </div>

        {prediction && (<div id="predictions" className="tabcontent" style={{ display: 'block' }}>
            <span>Top predictions:</span>
            <div id="predictions-list">
                <ul id="poke-topk">
                    {prediction?.topk.map(item => (<Link to={`/${item.pred}`}>
                        <li key={item.pred}>
                            <span>
                                {capitalize(item.pred)} ({Math.round(item.conf * 100000) / 1000}% confidence)
                            </span>
                        </li>
                    </Link>))}
                </ul>
            </div>
        </div>)
        }
        <div id="button-container">
            <button type="button" id="predict-button" onClick={handleCrop}>
                Predict
            </button>
        </div>
    </StyledHome>
}