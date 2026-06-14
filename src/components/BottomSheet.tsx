import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

export type SheetState = 'expanded' | 'half' | 'collapsed';

interface BottomSheetProps {
  children: React.ReactNode;
  currentState?: SheetState;
  onStateChange?: (state: SheetState) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ children, currentState = 'half', onStateChange }) => {
  const [internalState, setInternalState] = useState<SheetState>(currentState);
  const controls = useAnimation();

  const snapHeights = {
    expanded: 80,           // Leaves 80px at the top so it doesn't cover the role selector
    half: window.innerHeight * 0.55,  // Map gets 45vh, list gets 55vh (this is the top offset)
    collapsed: window.innerHeight - 80, // Only 80px visible at the bottom
  };

  const activeState = currentState || internalState;

  useEffect(() => {
    controls.start({ y: snapHeights[activeState] });
  }, [activeState, controls, snapHeights]);

  const updateState = (newState: SheetState) => {
    setInternalState(newState);
    if (onStateChange) onStateChange(newState);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // pixels to trigger a state change
    
    if (info.velocity.y > 500 || info.offset.y > threshold) {
      // Swiped down
      if (activeState === 'expanded') updateState('half');
      else if (activeState === 'half') updateState('collapsed');
    } else if (info.velocity.y < -500 || info.offset.y < -threshold) {
      // Swiped up
      if (activeState === 'collapsed') updateState('half');
      else if (activeState === 'half') updateState('expanded');
    } else {
      // Snap back to current state if didn't drag far enough
      controls.start({ y: snapHeights[activeState] });
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ y: snapHeights[activeState] }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: snapHeights.expanded, bottom: snapHeights.collapsed }}
      onDragEnd={handleDragEnd}
      dragElastic={0.2}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000, // Above the map
        touchAction: 'none' // Prevent scrolling the page while dragging
      }}
    >
      {/* Drag Handle Area */}
      <Box sx={{ p: 2, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
        <Box sx={{ 
          width: 40, height: 4, 
          bgcolor: 'rgba(255,255,255,0.2)', 
          borderRadius: 2, mx: 'auto', flexShrink: 0 
        }} />
      </Box>

      {/* Content Area */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          // Only allow scrolling the content if we are expanded, otherwise scrolling interferes with dragging in some browsers
          pointerEvents: activeState === 'collapsed' ? 'none' : 'auto',
          pb: 8
        }}
        // Stop drag propagation when scrolling the inner content
        onPointerDownCapture={(e: any) => {
           // Allow dragging from anywhere if not expanded, but if expanded, let inner content scroll
           if (activeState === 'expanded' && e.clientY > 60) {
             e.stopPropagation();
           }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
