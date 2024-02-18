import React, { useEffect, useState } from 'react';
import './Header.scss';
import axios from 'axios';
import PdfViewer from '../PdfViewer/PdfViewer';

interface File {
  fileName: string;
  category: string;
  fullPath: string;
}

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  // const [isCategoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/allFiles');
        const fileList: File[] = response.data.files.sort((a: File, b: File) => a.fileName.localeCompare(b.fileName));
        setAllFiles(fileList);
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Error fetching files. Please check the console for details.');
      }
    };
  
    fetchAllFiles();
  }, []);
  
  const handleFileClick = (fileName: string) => {
    const clickedFile = files.find(file => file.fileName === fileName);
  
    if (clickedFile) {
      const pdfUrl = `http://localhost:5000/file/Norms/${encodeURIComponent(fileName)}`;
      setFileContent(pdfUrl);
      setError(null);
      setSearchQuery('');
      document.body.classList.add('body-no-scroll');
    } else {
      console.error(`File (${fileName}) not found.`);
      setError(`File (${fileName}) not found.`);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);

    const normalizedSearchQuery = normalizeString(newSearchQuery);
    const filteredFiles = allFiles.filter(file =>
      normalizeString(file.fileName).includes(normalizedSearchQuery)
    );
    setFiles(filteredFiles);
  };

  const normalizeString = (str: string) => {
    return str.replace(/[_-]/g, '').toLowerCase();
  };

  // const toggleCategoryMenu = () => {
  //   setCategoryMenuOpen(!isCategoryMenuOpen);
  // };

  // const handleCategoryClick = (category: string) => {
  //   console.log(`Wybrano kategorię: ${category}`);
  //   setCategoryMenuOpen(false);
  // };

  return (
    <div className="header">
      <img src='/master-main-logo.png' className='logo' alt='masters-logo'></img>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Wyszukaj pliki..."
          value={searchQuery}
          onChange={handleSearchChange} />
        {searchQuery && (
          <div className='search-bar--results'>
            <ul>
              {files.map((file, index) => (
                <li key={index} className='pdf-list' onClick={() => handleFileClick(file.fileName)}>
                  <a className='pdf-link' href="/" onClick={(e) => { e.preventDefault(); } }>
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
            {error && (
              <div>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}
        {/* <div className="category-menu">
          <button onClick={toggleCategoryMenu}>Kategorie</button>
          {isCategoryMenuOpen && (
            <div className="category-dropdown">
              <div onClick={() => handleCategoryClick('IPC')}>IPC</div>
              <div onClick={() => handleCategoryClick('ISO')}>ISO</div>
              <div onClick={() => handleCategoryClick('AEC')}>AEC</div>
              <div onClick={() => handleCategoryClick('EIA')}>EIA</div>
            </div>
          )}
        </div> */}
      </div>
      <PdfViewer fileContent={fileContent}/>
    </div>
  );
};

export default Header;