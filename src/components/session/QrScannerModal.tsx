import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useTheme } from '../../theme/ThemeContext';
import { ConnectionMode } from '../../engine/types';

export interface QrScannerModalProps {
  isOpen: boolean;
  onScanned: (code: string, mode?: ConnectionMode, ssid?: string) => void;
  onCancel: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onScanned,
  onCancel,
}) => {
  const { triggerHaptic } = useTheme();
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Stop camera when closing
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const parseCodeFromText = (text: string) => {
    try {
      // ── Wi-Fi QR Code (WIFI:S:<ssid>;T:<sec>;P:<pass>;;) ──
      // Pass the raw Wi-Fi string straight to the consumer so it can trigger the guided Wi-Fi flow
      if (text.startsWith('WIFI:S:') || text.startsWith('WIFI:T:')) {
        triggerHaptic('heavy');
        stopCamera();
        onScanned(text); // JoinScreen handles parsing
        return true;
      }

      // ── Game Join URL (e.g. ?join=ZION&mode=onsite&ssid=...) ──
      if (text.includes('?join=') || text.includes('&join=')) {
        const url = new URL(text.startsWith('http') ? text : `https://dummy.com/${text}`);
        const code = url.searchParams.get('join');
        const mode = (url.searchParams.get('mode') as ConnectionMode) || undefined;
        const ssid = url.searchParams.get('ssid') || undefined;
        if (code) {
          triggerHaptic('heavy');
          stopCamera();
          onScanned(code.toUpperCase(), mode, ssid);
          return true;
        }
      }

      // ── Plain 4-letter room code ──
      const trimmed = text.trim().toUpperCase();
      if (/^[A-Z0-9]{4}$/.test(trimmed)) {
        triggerHaptic('heavy');
        stopCamera();
        onScanned(trimmed);
        return true;
      }
    } catch {
      // Ignore parse failure
    }
    return false;
  };

  const startCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Check for native BarcodeDetector API
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      if (BarcodeDetectorClass) {
        const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              if (rawVal) {
                parseCodeFromText(rawVal);
              }
            }
          } catch {
            // scan tick error, ignore
          }
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to access camera.');
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (BarcodeDetectorClass) {
      const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
      createImageBitmap(file)
        .then((bitmap) => detector.detect(bitmap))
        .then((barcodes: any[]) => {
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            parseCodeFromText(barcodes[0].rawValue);
          } else {
            setErrorMsg('No QR code detected in the uploaded photo.');
          }
        })
        .catch(() => {
          setErrorMsg('Could not process image.');
        });
    } else {
      setErrorMsg('Direct barcode reading from photo is not supported on this browser. Please type the 4-letter code.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-scaleUp"
      >
        <button
          onClick={() => {
            triggerHaptic('light');
            stopCamera();
            onCancel();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[var(--primary-action)]/10 text-[var(--primary-action)] flex items-center justify-center text-2xl">
          <Icon name="qr" size={28} />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-[var(--on-container)]">
            Scan Host Screen QR
          </h2>
          <p className="text-xs text-[var(--on-container-variant)]">
            Scan the <strong>Game QR</strong> to enter the room code automatically, or scan the{' '}
            <strong>Wi-Fi QR</strong> to connect to the host&apos;s hotspot.
          </p>
        </div>

        {/* Video Camera Viewport */}
        <div className="w-full h-64 rounded-2xl bg-black relative overflow-hidden flex items-center justify-center border-2 border-[var(--border-tint)]">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Scan Box Reticle */}
              <div className="absolute inset-8 border-2 border-dashed border-[var(--primary-action)] rounded-2xl pointer-events-none animate-pulse" />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-4 text-white/80">
              <Icon name="eye" size={36} />
              <span className="text-xs font-bold text-center">
                Camera is currently idle.
              </span>
              <Button
                variant="primary"
                size="sm"
                pill
                onClick={startCamera}
                className="font-bold shadow-md"
              >
                Turn On Camera
              </Button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="w-full p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Alternative: Take Photo / File input */}
        <div className="w-full flex flex-col gap-2">
          <label className="w-full py-2.5 px-4 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-xs font-bold text-[var(--on-container)] border border-[var(--border-tint)] flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Icon name="search" size={16} />
            <span>Upload or Snap Photo of QR</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            variant="tonal"
            size="md"
            pill
            onClick={() => {
              triggerHaptic('light');
              stopCamera();
              onCancel();
            }}
            className="w-full font-bold"
          >
            Type Code Manually
          </Button>
        </div>
      </Card>
    </div>
  );
};
