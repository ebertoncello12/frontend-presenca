import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Upload, Tooltip, Modal } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import jsQR from 'jsqr';
import StudentService from '../../services/Student/StudentService';
import { useSelector } from 'react-redux';

import './QrCode.css';
import {useNavigate} from "react-router-dom";
import * as faceapi from "face-api.js";

const QrCode = ({ aluno }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFaceRecognized, setIsFaceRecognized] = useState(false);
  const [isPresenceFailed, setIsPresenceFailed] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const canvasRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isFaceValid, setFaceValid] = useState(false)

  const [labeledDescriptors, setLabeledDescriptors] = useState([])
  const [recognitionMessage, setRecognitionMessage] = useState('') // Mensagem de reconhecimento
    const decodedPayload = useSelector((state) => state.auth.profile.decodedPayload);




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

      loadReferenceImage() // Carregar a imagem de referência após os modelos serem carregados
    })
  }

  // Carregar a imagem de referência (enzzo.png) e calcular o descritor facial
  const loadReferenceImage = async () => {
      const imageUrl = decodedPayload.payload.registrationFace;
      const studentName = decodedPayload.payload.studentName;
      console.log(studentName)
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
    const faceMyDetect = () => {
        if (!modelLoaded || labeledDescriptors.length === 0) return;

        console.log('precisa cair aqui')

        let hasRecognized = false; // Variável para verificar se já foi chamado

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

            // Comparar a face da webcam com a imagem de referência usando FaceMatcher
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
                    message.success('Reconhecimento facial bem-sucedido!');
                    setIsFaceRecognized(true);
                     setModalVisible(false);
                    setIsPresenceFailed(false);

                } else {
                    setRecognitionMessage('Reconhecimento falhou. Nenhuma correspondência encontrada.')
                }
            }
        }, 200)
    }


  console.log(decodedPayload,'teste')



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
                  <Tooltip title="Clique para importar uma imagem contendo um QR Code">
                    <Button icon={<UploadOutlined/>}>Importar Imagem do QR Code</Button>
                  </Tooltip>
                </Upload>
                <Tooltip title="Clique para usar a câmera e escanear o QR Code">
                  <Button className="qr-code-camera" onClick={startCamera} icon={<VideoCameraOutlined/>}>
                    Usar Câmera para Scanear
                  </Button>
                </Tooltip>
              </>
          ) : (
              <>
                <video ref={videoRef} className="qr-code-video" autoPlay muted/>
                <Button className="qr-code-camera" onClick={stopCamera}>
                  Fechar Câmera
                </Button>
              </>
          )}
        </div>


        {/* Modal de Reconhecimento Facial */}
        <Modal
            title="Reconhecimento Facial"
            visible={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              stopCamera();
            }}
            footer={[
              <Button key="cancel" onClick={() => {
                setModalVisible(false);
                stopCamera();
              }}>
                Fechar
              </Button>,
              <Button
                  key="start"
                  type="primary"
                  onClick={startFaceRecognition}
              >
                Iniciar Reconhecimento
              </Button>,
            ]}
        >
          <p>Por favor, posicione-se frente à câmera para iniciar o reconhecimento facial.</p>
          {isCameraOpen && (
              <div className="myapp">
                <div style={{ position: 'relative', width: '940px', height: '650px' }}>
                  <video ref={videoRef} className="qr-code-video" autoPlay muted style={{ width: '100%', height: '100%' }} />
                  <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                </div>
                <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                  {recognitionMessage}
                </div>
              </div>
          )}

        </Modal>

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
          <div style={{position: 'relative', width: '940px', height: '650px'}}>
            <video ref={videoRef} autoPlay muted style={{width: '100%', height: '100%'}}/>
            <div ref={canvasRef} style={{position: 'absolute', top: 0, left: 0}}/>
          </div>
          <div style={{marginTop: '20px', fontSize: '20px', fontWeight: 'bold'}}>
            {recognitionMessage}
          </div>
        </div>
      </div>
  )
      ;
};

export default QrCode;
