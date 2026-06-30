import React, {useRef, useState} from "react";

interface ZoomableImageProps {
    src: string;
    onClose: () => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({src, onClose}) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedDimensions, setZoomedDimensions] = useState<{ width: number; height: number } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const isOverflowX = isZoomed && zoomedDimensions ? zoomedDimensions.width > window.innerWidth : false;
    const isOverflowY = isZoomed && zoomedDimensions ? zoomedDimensions.height > window.innerHeight : false;

    return (
        <div
            ref={scrollContainerRef}
            className={`w-full h-full overflow-auto flex transition-all duration-300 ${isZoomed ? 'p-4 sm:p-8' : ''}`}
            style={{
                alignItems: isOverflowY ? 'flex-start' : 'center',
                justifyContent: isOverflowX ? 'flex-start' : 'center',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <img
                src={src}
                alt="Attachment"
                className={`object-contain select-none media-element transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                style={{
                    width: isZoomed && zoomedDimensions ? `${zoomedDimensions.width}px` : 'auto',
                    height: isZoomed && zoomedDimensions ? `${zoomedDimensions.height}px` : 'auto',
                    maxHeight: isZoomed ? 'none' : '90%',
                    maxWidth: isZoomed ? 'none' : '90%',
                }}
                draggable={true}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isZoomed && e.currentTarget) {
                        setZoomedDimensions({
                            width: e.currentTarget.clientWidth * 2.5,
                            height: e.currentTarget.clientHeight * 2.5
                        });
                        setTimeout(() => {
                            if (scrollContainerRef.current) {
                                const container = scrollContainerRef.current;
                                container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
                                container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
                            }
                        }, 10);
                    }
                    setIsZoomed(!isZoomed);
                }}
            />
        </div>
    );
};

export default ZoomableImage;
