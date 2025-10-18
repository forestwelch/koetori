# Accessibility Features

## Keyboard Shortcuts

### Recording Control

- **Space Bar**: Start/stop recording (when not in transcription view)
  - Only works when focus is on the page body (not in text inputs)
  - Disabled when transcription is displayed
  - Disabled while processing audio

## ARIA Labels & Semantic HTML

### Record Button

- `aria-label`: Dynamic label indicating current state
  - "Start recording (Press Space)" when idle
  - "Stop recording" when recording
  - "Processing audio" when processing
- `aria-pressed`: Indicates recording state (true/false)
- `aria-hidden="true"`: Applied to decorative SVG icons

### Status Messages

- `role="status"`: Announces state changes
- `aria-live="polite"`: Screen readers announce updates without interrupting
- `aria-atomic="true"`: Reads entire message on update

### Error Alerts

- `role="alert"`: Immediate announcement of errors
- `aria-live="polite"`: Ensures error messages are read

### Transcription Display

- `role="region"`: Marks transcription area
- `aria-label="Transcription result"`: Describes the region
- Copy button with dynamic label:
  - "Copy transcription to clipboard" when ready
  - "Copied to clipboard" when copied

### Audio Visualizer

- `role="img"`: Marks as visual content
- `aria-label="Audio level visualization"`: Describes purpose

### Main Container

- `role="main"`: Identifies primary content area
- `aria-label`: Describes the application

## Visual Indicators

### Focus States

- All interactive elements have visible hover states
- Button scale animations on interaction
- Color transitions on hover

### State Communication

- Recording state: Red color scheme with pulse animations
- Idle state: Blue/indigo color scheme
- Processing state: Disabled button with opacity
- Error state: Rose/red background with border

## Mobile Accessibility

- Touch-friendly button sizes (minimum 44x44px)
- Responsive text sizes
- Adequate spacing for touch targets
- Mobile-optimized visualizer

## Screen Reader Support

All interactive elements and state changes are properly announced to screen readers through:

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy

## Future Enhancements

- [ ] High contrast mode support
- [ ] Reduced motion preference support
- [ ] Custom keyboard shortcut configuration
- [ ] Focus trap in modal states
- [ ] Skip to content link
