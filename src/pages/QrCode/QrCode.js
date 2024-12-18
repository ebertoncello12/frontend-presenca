import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Upload, Tooltip } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import jsQR from 'jsqr';
import StudentService from '../../services/Student/StudentService';
import { useSelector } from 'react-redux';

import './QrCode.css'; // Importe um arquivo CSS para estilização

const QrCode = ({ aluno }) => {
  const [scanResult, setScanResult] = useState('');
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const decodedPayload = useSelector((state) => state.auth.profile.decodedPayload);

  console.log(decodedPayload.payload.studentId, 'AA')


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
            handleScanResult(code.data); // Envia o resultado do QR Code para o método handleScanResult
            stopCamera();
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

  const handleScanResult = async (data) => {
    try {
      // Aqui você poderá manipular ou validar o 'data' antes de enviar para o serviço
      await StudentService.patchMatkAttendance(decodedPayload?.payload?.studentId,data);
      message.success('Presença marcada com sucesso!');
    } catch (error) {
      console.error('Erro ao marcar a presença:', error);
      console.log(error.response.data.message)
      message.error(error.response.data.message);
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
          handleScanResult(decodedQR);
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
                <Button icon={<UploadOutlined />}>Importar Imagem do QR Code</Button>
              </Tooltip>
            </Upload>
            <Tooltip title="Clique para usar a câmera e escanear o QR Code">
              <Button className="qr-code-camera" onClick={startCamera} icon={<VideoCameraOutlined />}>
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
      {scanResult && (
        <div className="qr-code-result">
          <p>Resultado do scan: {scanResult}</p>
        </div>
      )}
      <Button className="qr-code-clear" onClick={() => setScanResult('')}>Limpar</Button>
    </div>
  );
};

export default QrCode;
