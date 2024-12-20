import { useRef, useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'

function Attendance() {
    const videoRef = useRef()
    const canvasRef = useRef()
    const [modelLoaded, setModelLoaded] = useState(false)
    const [labeledDescriptors, setLabeledDescriptors] = useState([]) // Lista de descritores rotulados
    const [recognitionMessage, setRecognitionMessage] = useState('') // Mensagem de reconhecimento

    // Carregar a webcam e os modelos
    useEffect(() => {
        startVideo()
        loadModels()
    }, [])

    // Abre a webcam
    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream
            })
            .catch((err) => {
                console.log(err)
            })
    }



    // Carregar os modelos SSDMobileNetV1 e outros modelos
    const loadModels = () => {
        Promise.all([
            // Carregar o modelo SSDMobileNetV1
            faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models")
        ]).then(() => {
            setModelLoaded(true)
            console.log('Modelos carregados com sucesso!')
            loadReferenceImage() // Carregar a imagem de referência após os modelos serem carregados
        })
    }

    // Carregar a imagem de referência (enzzo.png) e calcular o descritor facial
    const loadReferenceImage = async () => {
        const image = await faceapi.fetchImage('/enzzo.png')
        const detections = await faceapi.detectSingleFace(image)
            .withFaceLandmarks()
            .withFaceDescriptor()

        if (detections) {
            // Adicionar o descritor facial à lista de descritores rotulados
            const labeledDescriptor = new faceapi.LabeledFaceDescriptors('enzzo', [detections.descriptor])
            setLabeledDescriptors([labeledDescriptor]) // Aqui estamos assumindo que você só tem uma pessoa como referência
            console.log('Descritor da imagem de referência carregado com sucesso!')
            faceMyDetect() // Chama a função de detecção após carregar a imagem de referência
        }
    }

    // Detecta faces da webcam usando o SSDMobileNetV1 e compara com a imagem de referência
    const faceMyDetect = () => {
        console.log('caiu aqui')
        if (!modelLoaded || labeledDescriptors.length === 0) return; // Garante que os modelos e a imagem de referência estejam carregados

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current,
                new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()

            // Desenhar os resultados na tela
            canvasRef.current.innerHTML = ''
            const canvas = faceapi.createCanvasFromMedia(videoRef.current)
            canvasRef.current.append(canvas)

            faceapi.matchDimensions(canvas, {
                width: 940,
                height: 650
            })

            const resizedDetections = faceapi.resizeResults(detections, {
                width: 940,
                height: 650
            })

            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

            console.log('parece que e aqui')

            // Comparar a face da webcam com a imagem de referência usando FaceMatcher
            if (detections.length > 0) {
                const faceDescriptor = detections[0].descriptor

                // Usar FaceMatcher para comparar a face detectada com os descritores rotulados
                const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6) // 0.6 é o limiar de similaridade
                const bestMatch = faceMatcher.findBestMatch(faceDescriptor)

                // Verificar o resultado do reconhecimento
                if (bestMatch.label === 'enzzo') {
                    setRecognitionMessage('Reconhecimento bem-sucedido! A pessoa é Enzzo.')
                } else {
                    setRecognitionMessage('Reconhecimento falhou. Nenhuma correspondência encontrada.')
                }
            }
        }, 200)
    }

    return (
        <div className="myapp">
            <div style={{ position: 'relative', width: '940px', height: '650px' }}>
                <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%' }} />
                <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
            </div>
            <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                {recognitionMessage}
            </div>
        </div>
    )
}

export default Attendance
