declare module "@/components/DomeGallery.jsx" {
  interface DomeImage { src: string; alt?: string }
  interface DomeGalleryProps {
    images?: (string | DomeImage)[];
    fit?: number;
    fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
    minRadius?: number;
    maxRadius?: number;
    padFactor?: number;
    overlayBlurColor?: string;
    maxVerticalRotationDeg?: number;
    dragSensitivity?: number;
    enlargeTransitionMs?: number;
    segments?: number;
    dragDampening?: number;
    openedImageWidth?: string;
    openedImageHeight?: string;
    imageBorderRadius?: string;
    openedImageBorderRadius?: string;
    grayscale?: boolean;
  }
  const DomeGallery: (props: DomeGalleryProps) => JSX.Element;
  export default DomeGallery;
}
