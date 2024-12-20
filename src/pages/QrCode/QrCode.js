import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Upload, Tooltip, Modal, Popover, Spin, Progress } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { notification } from 'antd';

import jsQR from 'jsqr';
import StudentService from '../../services/Student/StudentService';
import { useSelector } from 'react-redux';

import './QrCode.css';
import GeoLocalizaion from "../../components/GeoLocalization"
import {useNavigate} from "react-router-dom";
import * as faceapi from "face-api.js";
import GeoLocatization from "../../components/GeoLocalization";

const QrCode = ({ aluno }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVisibleVideo, setIsVisibleVideo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFaceRecognized, setIsFaceRecognized] = useState(false);
    const [isInsideRadius, setInsideRadius] = useState(false);
    console.log(isInsideRadius, 'dentro do raio')// Estado que indica se o usuário está dentro do raio


    const [isFaceRecognitionInProgress, setIsFaceRecognitionInProgress] = useState(false);
  const [isPresenceFailed, setIsPresenceFailed] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const canvasRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isFaceValid, setFaceValid] = useState(false)
 const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    console.log(failedAttempts)





  const [labeledDescriptors, setLabeledDescriptors] = useState([])
  const [recognitionMessage, setRecognitionMessage] = useState('') // Mensagem de reconhecimento
    const decodedPayload = useSelector((state) => state.auth.profile.decodedPayload);



    const startVideo = () => {
        setIsLoadingVideo(true);

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
                setIsLoadingVideo(false); // Define como false quando terminar
            })
            .catch((err) => {
                console.log(err);
                setIsLoadingVideo(false);
            });
    };



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

      loadReferenceImage() // Carregar a imagem de referência após os modelos serem carregados
    })
  }

  // Carregar a imagem de referência (enzzo.png) e calcular o descritor facial
  const loadReferenceImage = async () => {
      const imageUrl = decodedPayload.payload.registrationFace;
      const studentName = decodedPayload.payload.studentName;

      const image = await faceapi.fetchImage(imageUrl);
      const detections = await faceapi.detectSingleFace(image)
        .withFaceLandmarks()
        .withFaceDescriptor()

    if (detections) {

      // Adicionar o descritor facial à lista de descritores rotulados
      const labeledDescriptor = new faceapi.LabeledFaceDescriptors(decodedPayload.payload.studentName, [detections.descriptor])
      setLabeledDescriptors([labeledDescriptor]) // Aqui estamos assumindo que você só tem uma pessoa como referência

      faceMyDetect() // Chama a função de detecção após carregar a imagem de referência
    }
  }

  // Detecta faces da webcam usando o SSDMobileNetV1 e compara com a imagem de referência
    // Detecta faces da webcam usando o SSDMobileNetV1 e compara com a imagem de referência
    const faceMyDetect = () => {
        if (!modelLoaded || labeledDescriptors.length === 0) return;



        let hasRecognized = false; // Variável para verificar se já foi chamado
        let failedAttempts = 0; // Variável local para contar as tentativas falhas
        const intervalId = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current,
                new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()






            if (detections.length > 0 && !hasRecognized) { // Verifica se a face foi reconhecida e se já não foi chamada a função
                const faceDescriptor = detections[0].descriptor

                // Usar FaceMatcher para comparar a face detectada com os descritores rotulados
                const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6) // 0.6 é o limiar de similaridade
                const bestMatch = faceMatcher.findBestMatch(faceDescriptor)
                console.log(bestMatch, 'v')

                // Verificar o resultado do reconhecimento
                if (bestMatch.label === decodedPayload.payload.studentName) {
                    setRecognitionMessage(decodedPayload.payload.studentName)
                    handleScanResult(scanResult); // Chama apenas uma vez
                    hasRecognized = true; // Marca que o reconhecimento já ocorreu
                    notification.success({
                        message: `Reconhecimento facial bem-sucedido! Bem-vindo, ${decodedPayload.payload.studentName}`,
                        description: 'Você foi reconhecido com sucesso.',
                        placement: 'topRight', // Posição da notificação
                        duration: 5, // Tempo em segundos para a notificação desaparecer
                        style: { fontSize: '15' }, // Aumenta o tamanho da fonte
                    });
                    setIsFaceRecognized(true);
                    setModalVisible(false);
                    setIsPresenceFailed(false);
                    setIsFaceRecognitionInProgress(false);

                    // Resetar o contador de tentativas falhas em caso de sucesso
                    setFailedAttempts(0); // Resetar as tentativas falhas
                    failedAttempts = 0;
                } else {
                    // Incrementar o contador de tentativas falhas
                    failedAttempts++;
                    setFailedAttempts((prevAttempts) => prevAttempts + 1);
                    if (failedAttempts === 20) {

                        setRecognitionMessage('Reconhecimento falhou. Nenhuma correspondência encontrada.');
                        setIsFaceRecognitionInProgress(false);
                        message.warning('Falha ao tentar fazer o reconhecimento facial, tente novamente!');
                        notification.warning({
                            message: 'Erro no Reconhecimento Facial',
                            description: 'Falha ao tentar fazer o reconhecimento facial. Tente novamente!',
                            placement: 'topRight', // Posição da notificação
                            duration: 5, // Tempo em segundos para a notificação desaparecer
                            style: { fontSize: '18px' }, // Aumenta o tamanho da fonte
                        });
                        setIsFaceRecognized(false);
                        stopCamera();
                        setModalVisible(false)

                        // registerFailedAttempt(decodedPayload.payload.studentId);


                        clearInterval(intervalId);
                    }
                }
            }
        }, 200)
    }



  useEffect(() => {
    if (isCameraOpen && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        video.play();

        const captureFrame = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScanResult(code.data);
            stopCamera();
            setModalVisible(true);
          } else {
            requestAnimationFrame(captureFrame);
          }
        };

        requestAnimationFrame(captureFrame);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [isCameraOpen]);

    useEffect(() => {
        if (modelLoaded && labeledDescriptors.length > 0) {
            // Chama faceMyDetect apenas quando os modelos estão carregados e o labeledDescriptors está atualizado
            faceMyDetect();
        }
    }, [modelLoaded, labeledDescriptors]); // Dependências do efeito: `modelLoaded` e `labeledDescriptors`


    const handleScanResult = async (data) => {
    try {
      await StudentService.patchMatkAttendance(decodedPayload?.payload?.studentId, data);
      message.success('Presença marcada com sucesso!');
     // navigate('/aulas');
    } catch (error) {
      console.error('Erro ao marcar a presença:', error);
      message.error(error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  const handleImageUpload = (info) => {
    if (!info.file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target.result;

      try {
        const decodedQR = await decodeQRCode(imageDataUrl);
        if (decodedQR) {
          setScanResult(decodedQR);
          setModalVisible(true);
        } else {
          message.warning('Nenhum QR Code encontrado na imagem.');
        }
      } catch (error) {
        console.error('Erro ao decodificar QR Code:', error);
        message.error('Erro ao decodificar QR Code.');
      }
    };

    reader.readAsDataURL(info.file);
  };

  const startCamera = () => {
    setIsCameraOpen(true);

    const videoConstraints = {
      facingMode: 'environment',
    };

    navigator.mediaDevices.getUserMedia({ video: videoConstraints })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Erro ao acessar a câmera:', err);
          message.error('Erro ao acessar a câmera.');
        });
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
    const stream = videoRef.current ? videoRef.current.srcObject : null;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const decodeQRCode = (imageDataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data);
        } else {
          reject(new Error('Nenhum QR Code encontrado na imagem.'));
        }
      };

      img.onerror = function(err) {
        reject(err);
      };

      img.src = imageDataUrl;
    });
  };

  const startFaceRecognition = async () => {
    setIsVisibleVideo(true)
    setIsFaceRecognitionInProgress(true)
    await startVideo()
    loadModels()
  };



    return (
        <div className="qr-code-container">
            <h2 className="qr-code-title">Scanear QR Code</h2>

            <div className="qr-code-actions">
                {!isCameraOpen ? (
                    <>
                        <Upload
                            className="qr-code-upload"
                            accept=".jpg,.png,.jpeg"
                            beforeUpload={() => false}
                            onChange={handleImageUpload}
                            showUploadList={false}
                        >
                            <Tooltip title={isInsideRadius ? "Clique para importar uma imagem contendo um QR Code" : "Para escanear o QR Code, você precisa estar dentro da localização permitida"}>
                                <Button disabled={!isInsideRadius} icon={<UploadOutlined />}>Importar Imagem do QR Code</Button>
                            </Tooltip>
                        </Upload>
                        <Tooltip title={isInsideRadius ? "Clique para usar a câmera e escanear o QR Code" : "Para escanear o QR Code, você precisa estar dentro da localização permitida"}>
                            <Button className="qr-code-camera" disabled={!isInsideRadius} onClick={startCamera} icon={<VideoCameraOutlined />}>
                                Usar Câmera para Scanear
                            </Button>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <video ref={videoRef} className="qr-code-video" autoPlay muted />
                        <Button className="qr-code-camera" onClick={stopCamera}>
                            Fechar Câmera
                        </Button>
                    </>
                )}

            </div>

            <Modal
                title="Reconhecimento Facial"
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    stopCamera();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setModalVisible(false);
                            stopCamera();
                        }}
                    >
                        Fechar
                    </Button>,
                    <Button
                        key="start"
                        type="primary"
                        onClick={startFaceRecognition}
                        loading={isFaceRecognitionInProgress}
                        disabled={isFaceRecognitionInProgress}
                    >
                        {isFaceRecognitionInProgress ? 'Realizando Reconhecimento Facial' : 'Iniciar Reconhecimento'}
                    </Button>,
                ]}
                width={600}
                style={{ textAlign: 'center' }}
            >
                <p>Por favor, posicione-se frente à câmera para iniciar o reconhecimento facial.</p>

                <Progress
                    percent={((failedAttempts / 20) * 100).toFixed(2)}
                    status={failedAttempts >= 20 ? 'exception' : 'active'}
                    showInfo={true}
                    strokeColor={
                        failedAttempts < 7
                            ? '#FF4D4F'
                            : failedAttempts < 14
                                ? '#FF9C06'
                                : '#52C41A'
                    }
                    style={{ marginBottom: '20px' }}
                />

                {isVisibleVideo && (
                    <div
                        className="video-container"
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            paddingTop: '100%',
                        }}
                    >
                        {isLoadingVideo && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    zIndex: 2,
                                }}
                            >
                                <Spin size="large" />
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            className="qr-code-video"
                            autoPlay
                            muted
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: isVisibleVideo ? 1 : 0,
                                transition: 'opacity 1s ease-in-out',
                                zIndex: 1,
                            }}
                        />

                        <div
                            ref={canvasRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>
                )}

                <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                    {recognitionMessage}
                </div>
            </Modal>

            {/* Colocando o GeoLocalization logo abaixo */}
            <div style={{ marginTop: '30px', padding: '10px', textAlign: 'center' }}>
                <GeoLocatization setInsideRadius={setInsideRadius}/>
            </div>

            {/* Modal de Falha na Presença */}
            <Modal
                title="Falha ao Marcar Presença"
                visible={isPresenceFailed}
                onCancel={() => setIsPresenceFailed(false)}
                footer={[
                    <Button key="close" onClick={() => setIsPresenceFailed(false)}>
                        Fechar
                    </Button>,
                ]}
            >
                <p>Não foi possível marcar a presença. Tente escanear o QR Code novamente.</p>
            </Modal>

            <div className="myapp">
                <div style={{ position: 'relative', width: '940px', height: '650px' }}>
                    <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%' }} />
                    <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                </div>
            </div>
        </div>
    );

};

export default QrCode;
