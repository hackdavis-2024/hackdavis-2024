import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import AppBottomNavigation from './AppBottomNavigation';
import { IconButton, Modal, Box, TextField, Button } from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import CloseIcon from '@mui/icons-material/Close'

const CameraContainer = styled.div`
  position: relative;
  width: 100%; 
  height: 0;
  padding-bottom: 56.25%; // Maintains 16:9 aspect ratio
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; // Covers the available space without breaking the aspect ratio
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 300px, rgba(0, 0, 0, 0.5) 300px);
  z-index: 10;
`;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [open, setOpen] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState('');
  const [imageBlob, setImageBlob] = React.useState('');
  const [caption, setCaption] = React.useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(error => {
            console.error('Error playing the video stream', error);
          });
        }
      })
      .catch(error => {
        console.error('Error accessing the camera', error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      const { videoWidth, videoHeight } = video;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      const imageURL = canvas.toDataURL('image/jpeg', 0.5);
      setImageSrc(imageURL);
      // Convert canvas to Blob
      canvas.toBlob((blob) => {
          setImageBlob(blob);  // Assuming setImageBlob stores the Blob for later use
          handleOpen();        // Handling any other logic needed after capture
      }, 'image/jpeg', 0.5);
    }
  };

  const postPhoto = async () => {
    console.log('Posting photo');

    if (!imageBlob) {
      console.error('No image to upload');
      return;
    }
    console.log(imageBlob);
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('caption', caption);
    // Log FormData contents (for debugging; works in browsers that support it)
    
    axios.post('http://localhost:5001/images/upload', formData)
    .then((response) => {
      console.log('Response:', response);
    }
    )
    .catch((error) => {
      console.error('Error uploading image:', error);
    });
    handleClose();
  };

  return (
    <CameraContainer>
      <Video ref={videoRef} autoPlay playsInline />
      <Overlay>
      </Overlay>
      <IconButton 
        onClick={captureImage} 
        sx={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <CameraIcon fontSize='large' color='secondary'/>
      </IconButton>
      <canvas ref={canvasRef} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <IconButton onClick={handleClose} style={{ position: 'absolute', top: 3, right: 3 }}>
            <CloseIcon />
          </IconButton>
          <img src={imageSrc} alt="Captured" style={{ width: '100%' }} />
          <TextField label="Caption" fullWidth  onChange={(event)=>{setCaption(event.target.value)}}/>
          <Button variant="contained" color="primary" fullWidth onClick={postPhoto}>
            Post 
          </Button>
        </Box>
      </Modal>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', zIndex: 30 }}>
        <AppBottomNavigation />
      </div>
    </CameraContainer>
  )
}
