import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.scss';
import PdfViewer from '../../components/PdfViewer/PdfViewer';

interface File {
  fileName: string;
  category: string;
  fullPath: string;
}

interface ButtonInfo {
  name: string;
  description: string;
}

const Home: React.FC = () => {
  const [allNormFiles, setAllNormFiles] = useState<File[]>([]);
  const [normFiles, setNormFiles] = useState<File[]>([]);
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const normResponse = await axios.get('http://localhost:5000/allFiles');
        const knowledgeBaseResponse = await axios.get('http://localhost:5000/allKnowledgeBaseFiles');

        const normFileList: File[] = normResponse.data.files.sort((a: File, b: File) => a.fileName.localeCompare(b.fileName));
        const knowledgeBaseFileList: File[] = knowledgeBaseResponse.data.files.sort((a: File, b: File) => a.fileName.localeCompare(b.fileName));

        setAllNormFiles(normFileList);
        setNormFiles(normFileList);

        setKnowledgeBaseFiles(knowledgeBaseFileList);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Error fetching files. Please check the console for details.');
      }
    };

    fetchAllFiles();
  }, []);

  const handleFolderClick = (folder: string) => {
    setSelectedFolder(folder);

    if (folder === 'KNOWLEDGEBASE') {
      setNormFiles([]);
    } else {
      const filteredFiles = allNormFiles.filter(file => file.fileName.slice(0, 3).toLowerCase() === folder.toLowerCase());
      setNormFiles(filteredFiles);
    }
  };

  const handleFileClick = (fileName: string) => {
    const clickedFile = normFiles.find((file) => file.fileName === fileName);

    if (clickedFile) {
      const folderPath = 'Norms';
      const pdfUrl = `http://localhost:5000/file/${folderPath}/${encodeURIComponent(fileName)}`;
      setFileContent(pdfUrl);
      setError(null);
    } else {
      const knowledgeBaseFile = knowledgeBaseFiles.find((file) => file.fileName === fileName);

      if (knowledgeBaseFile) {
        window.open(`http://localhost:5000/file/KnowledgeBase/${encodeURIComponent(fileName)}`, '_blank');
      } else {
        console.error(`File (${fileName}) not found.`);
        setError(`File (${fileName}) not found.`);
      }
    }
  };

  const buttonInfo: ButtonInfo[] = [
    { name: 'IPC', description: 'Standardy systemów zarządzania i norm technicznych. Tu znajdziesz wymagania do naszych systemów zarządzania które stosujemy w naszej firmie.' },
    { name: 'ISO', description: 'Normy techniczne kryteriów wykonywania modułów elektronicznych. Tutaj znajdziesz informacje jak sprawdzić zgodność wykonania i jakość elementów.' },
    { name: 'AEC', description: 'Normy wymagań dla komponentów przemysłu motoryzacyjnego. Tu znajdziesz jakie testy kwalifikacyjne przechodzą elementy posiadające kwalifikację AECQ.' },
    { name: 'EIA', description: 'Wymagania dla komponentów elektronicznych.' },
    { name: 'KNOWLEDGEBASE', description: 'Tu znajdziesz dodatkowe informacje o technologii w procesach, raporty z badań i o rozwiązaniach problemów.' },
  ];

  function getFolderImageSource(folderName: string) {
    return process.env.PUBLIC_URL + `/${folderName.toLowerCase()}-logo.png`;
  }

  return (
    <div className="home">
      <div className='home_title'>
        <img src='/libary-logo.png' className='libary-img' alt='Norm Libary Logo'></img>
        <h1>Biblioteka Norm</h1>
      </div>
      <div className="folder-buttons">
        {buttonInfo.map((button) => (
          <button
            key={button.name}
            className={`button ${selectedFolder === button.name ? 'active' : ''}`}
            onClick={() => handleFolderClick(button.name)}
          >
            <img
              src={getFolderImageSource(button.name)}
              alt={`${button.name} Logo`}
              className='folder-logo'
            />
            <p className='button-description'>{button.description}</p>
          </button>
        ))}
      </div>
      <div className='centered-list'>
        <ul>
          {selectedFolder === 'KNOWLEDGEBASE' ? (
            knowledgeBaseFiles.map((file, index) => (
              <li key={index} className='t' onClick={() => handleFileClick(file.fileName)}>
                <a className='' href="/" onClick={(e) => { e.preventDefault(); }}>
                  {file.fileName}
                </a>
              </li>
            ))
          ) : (
            normFiles.map((file, index) => (
              <li key={index} className='t' onClick={() => handleFileClick(file.fileName)}>
                <a className='' href="/" onClick={(e) => { e.preventDefault(); }}>
                  {file.fileName}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}
      <PdfViewer fileContent={fileContent} />
    </div>
  );
};

export default Home;