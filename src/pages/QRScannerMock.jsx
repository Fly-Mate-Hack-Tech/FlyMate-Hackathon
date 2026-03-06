import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { ORADEA_NODES } from '../data/OradeaMapGraph';

const QRScannerMock = () => {
    const navigate = useNavigate();
    const [scanError, setScanError] = useState('');
    const [hasStarted, setHasStarted] = useState(false); // To prevent multiple inits in strict mode

    useEffect(() => {
        // We only want to initialize the scanner once
        if (hasStarted) return;

        // Optional config for the scanner
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: true
        };

        // The ID "reader" matches the div below
        const html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);

        const onScanSuccess = (decodedText) => {
            // Clear scanner on success
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });

            console.log("Scanned:", decodedText);

            // Check if the scanned text corresponds to one of our Oradea Airport nodes
            const scannedId = decodedText.trim().toLowerCase();

            // If the node exists in our graph, route to it.
            if (ORADEA_NODES[scannedId]) {
                navigate(`/map?scanned=true&origin=${scannedId}`);
            } else {
                // Fallback if they scan a random QR: assume Entrance for the hackathon context
                console.warn(`Node ${scannedId} not found. Defaulting to Entrance.`);
                navigate('/map?scanned=true&origin=entrance');
            }
        };

        const onScanFailure = (error) => {
            // Ignore routine scan failures (when it's just looking for a code and doesn't see one yet)
            // Only log or show major errors
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        setHasStarted(true);

        // Cleanup when component unmounts
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner on unmount. ", error);
            });
        };
    }, [hasStarted, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#000',
            color: 'white',
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden'
        }} className="animate-fade-in">

            {/* Header controls overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '1.5rem',
                paddingTop: '3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: 'pointer',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <X size={24} />
                </button>
                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Camera size={16} /> Live Scanner
                </div>
            </div>

            {/* Scanner Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div
                    id="reader"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        backgroundColor: '#111', // Dark background while loading
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 0 0 100vmax rgba(0,0,0,0.7)',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}
                />
            </div>

            {/* Global CSS overrides required for html5-qrcode inner elements to look decent in dark mode */}
            <style>{`
          #reader {
              border: none !important;
          }
          #reader select {
              background: #333;
              color: white;
              padding: 5px;
              border-radius: 8px;
              border: 1px solid #555;
              margin-bottom: 10px;
          }
          #reader button {
              background: var(--primary);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              margin: 5px;
          }
          #reader__dashboard_section_csr span {
              color: white !important;
          }
          #reader__dashboard_section_swaplink {
              color: var(--primary) !important;
              text-decoration: none;
          }
           #reader__status_span {
              color: var(--text-muted) !important;
          }
      `}</style>

            {/* Instructional text footer */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: 0, right: 0,
                textAlign: 'center',
                padding: '0 2rem',
                zIndex: 10
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Scan Wall Location QR</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Grant camera access and scan any FlyMate QR code</p>
            </div>

        </div>
    );
};

export default QRScannerMock;
