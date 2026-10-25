import React, { useEffect, useCallback } from 'react';
import { Bin } from './Bin';
import { ShelfRushBin } from '../engine/types';
import { BIN_PALETTE } from '../engine/constants';
import { motion, AnimatePresence } from 'framer-motion';

export interface BinGridProps {
  bins: ShelfRushBin[];
  correctBinId?: string | null;
  wrongBinId?: string | null;
  pulseBinId?: string | null;
  pointsDelta?: number | null;
  disabled?: boolean;
  onSelectBin: (binId: string) => void;
}

export const BinGrid: React.FC<BinGridProps> = ({
  bins,
  correctBinId,
  wrongBinId,
  pulseBinId,
  pointsDelta,
  disabled = false,
  onSelectBin,
}) => {
  const numBins = bins.length;

  // Keyboard shortcut listener: keys 1-7 and ArrowLeft/ArrowRight (for 2 bins)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key;
      const digit = parseInt(key, 10);
      if (!isNaN(digit) && digit >= 1 && digit <= numBins) {
        e.preventDefault();
        onSelectBin(bins[digit - 1].id);
        return;
      }
      if (numBins === 2) {
        if (key === 'ArrowLeft') {
          e.preventDefault();
          onSelectBin(bins[0].id);
        } else if (key === 'ArrowRight') {
          e.preventDefault();
          onSelectBin(bins[1].id);
        }
      }
    },
    [disabled, numBins, bins, onSelectBin]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderBin = (bin: ShelfRushBin, index: number, minHeightClass?: string) => {
    const color = BIN_PALETTE[index % BIN_PALETTE.length];
    return (
      <Bin
        key={bin.id}
        id={bin.id}
        label={bin.label}
        icon={bin.icon}
        position={index + 1}
        color={color}
        isCorrectHighlight={correctBinId === bin.id}
        isWrongSelected={wrongBinId === bin.id}
        isPulse={pulseBinId === bin.id}
        disabled={disabled}
        minHeightClass={minHeightClass}
        onSelect={onSelectBin}
      />
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto select-none px-1">
      {/* Floating score toast on correct sort */}
      <AnimatePresence>
        {pointsDelta && pointsDelta > 0 && (
          <motion.div
            key={Date.now()}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -36, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-emerald-500 text-white font-mono font-black rounded-full shadow-lg text-base pointer-events-none"
          >
            +{pointsDelta}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-bin Layout: 1 row, 2 equal cells (each at least 140px tall) */}
      {numBins === 2 && (
        <div className="grid grid-cols-2 gap-3">
          {bins.map((bin, idx) => renderBin(bin, idx, 'min-h-[140px]'))}
        </div>
      )}

      {/* 3-bin Layout: 1 row, 3 equal cells */}
      {numBins === 3 && (
        <div className="grid grid-cols-3 gap-3">
          {bins.map((bin, idx) => renderBin(bin, idx, 'min-h-[96px]'))}
        </div>
      )}

      {/* 4-bin Layout: 2x2 grid */}
      {numBins === 4 && (
        <div className="grid grid-cols-2 gap-3">
          {bins.map((bin, idx) => renderBin(bin, idx, 'min-h-[82px]'))}
        </div>
      )}

      {/* 5-bin Layout: row of 3 above row of 2 (second row cells wider) */}
      {numBins === 5 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            {bins.slice(0, 3).map((bin, idx) => renderBin(bin, idx, 'min-h-[76px]'))}
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {bins.slice(3, 5).map((bin, idx) => renderBin(bin, idx + 3, 'min-h-[76px]'))}
          </div>
        </div>
      )}

      {/* 6-bin Layout: 2 rows x 3 */}
      {numBins === 6 && (
        <div className="grid grid-cols-3 gap-3">
          {bins.map((bin, idx) => renderBin(bin, idx, 'min-h-[76px]'))}
        </div>
      )}

      {/* 7-bin Layout: row of 4 above row of 3 */}
      {numBins === 7 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {bins.slice(0, 4).map((bin, idx) => renderBin(bin, idx, 'min-h-[76px]'))}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-3">
            {bins.slice(4, 7).map((bin, idx) => renderBin(bin, idx + 4, 'min-h-[76px]'))}
          </div>
        </div>
      )}
    </div>
  );
};
