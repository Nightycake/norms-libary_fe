import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './PdfViewer.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  fileContent: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileContent }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(true);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

    const workerPort = pdfjs.GlobalWorkerOptions.workerPort;
    if (workerPort) {
      workerPort.postMessage({
        fontExtraProperties: {
          baseUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/`,
        },
      });
    }

    const handleWheel = (event: WheelEvent) => {
      if (fileContent) {
        const delta = Math.sign(event.deltaY);
        setPageNumber((prevPageNumber) => {
          const newPageNumber = prevPageNumber + delta;
          return Math.max(1, Math.min(newPageNumber, numPages || 1));
        });
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (fileContent) {
        if (event.key === 'PageDown') {
          setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
        } else if (event.key === 'PageUp') {
          setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
        } else if (event.key === 'Escape') {
          handleClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const pdfContainer = document.querySelector('canvas');
      if (pdfContainer && !pdfContainer.contains(event.target as Node)) {
        handleClose();
      }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fileContent, numPages, setPageNumber]);

  useEffect(() => {
    setShowPdfViewer(true);
  }, [fileContent]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleClose = () => {
    setShowPdfViewer(false);
    setNumPages(null);
    setPageNumber(1);
    document.body.classList.remove('body-no-scroll');
  };

  return (
    <div className={`pdf__body ${showPdfViewer ? 'visible' : 'hidden'}`}>
      {fileContent && showPdfViewer && (
        <div className="pdf-container">
          <p className='pdf-page-number'>Aby przewinąć dokument użyj scrol'a lub Pgdn/Pgup. Aby wyjść użyj przycisku lub Esc.</p>
          <Document file={fileContent} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          <div>
            <span className='pdf-page-number'>
              Page {pageNumber} of {numPages}
            </span>
            <button onClick={handleClose}>Zamknij PDF</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;