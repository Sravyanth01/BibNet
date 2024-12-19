import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';

const CitedReferences = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [references, setReferences] = useState('');
  const [referencesToShow, setReferencesToShow] = useState(10);
  const [showMorePapers, setShowMorePapers] = useState(5);
  const [showMorePapersIndex, setShowMorePapersIndex] = useState(5);
  const [showMoreButton, setShowMoreButton] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-data/');
        const papersData = response.data;
        setPapers(papersData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPapers();
  }, []);

  const handlePaperSelect = (e) => {
    const selectedPaper = papers.find((paper) => paper.Title === e.target.value);
    setSelectedPaper(selectedPaper);
    if (selectedPaper && selectedPaper.Reference) {
      const referencesData = selectedPaper.Reference;
      setReferences(referencesData);
      setReferencesToShow(10); // Reset to show 10 references initially
    } else {
      setReferences('');
    }
  };

  const handleShowMorePapers = () => {
    if (showMorePapersIndex < papers.length) {
      setShowMorePapersIndex(showMorePapersIndex + 5);
      if (showMorePapersIndex + 5 >= papers.length) {
        setShowMoreButton(false);
      }
    }
  };

  const handleShowLessPapers = () => {
    setShowMoreButton(true);
    setShowMorePapersIndex(5);
  };

  const handleShowMoreReferences = () => {
    if (referencesToShow < references.split(';').length) {
      setReferencesToShow(referencesToShow + 10); // Show the next 10 references
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'References',
        accessor: 'reference',
      },
    ],
    []
  );

  const data = React.useMemo(
    () =>
      references.split(';').slice(0, referencesToShow).map((reference, index) => ({
        reference: reference.replace(/"/g, ''),
      })),
    [references, referencesToShow]
  );

  const tableInstance = useTable({ columns, data });

  return (
    <div>
      <h1>Cited References</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <select value={selectedPaper ? selectedPaper.Title : ''} onChange={handlePaperSelect} style={{ width: '200px', overflowY: 'auto' }}>
          <option value="">Select a paper</option>
          {papers.slice(0, showMorePapersIndex).map((paper, index) => (
            <option key={index} value={paper.Title}>{paper.Title}</option>
          ))}
        </select>
        {showMoreButton && (
          <button onClick={handleShowMorePapers} style={{ marginLeft: '10px' }}>
            Show More Papers
          </button>
        )}
        {!showMoreButton && (
          <button onClick={handleShowLessPapers} style={{ marginLeft: '10px' }}>
            Show Less Papers
          </button>
        )}
      </div>
      {selectedPaper && (
        <div>
          <table {...tableInstance.getTableProps()} style={{ width: '80%', margin: '0 auto', padding: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tableInstance.headerGroups.map((headerGroup, index) => (
                  <th key={index} {...headerGroup.getHeaderGroupProps()} style={{ backgroundColor: '#f0f0f0', padding: '10px', border: '1px solid #ddd' }}>
                    {headerGroup.headers.map((column, index) => (
                      <span key={index} {...column.getHeaderProps()}>{column.render('Header')}</span>
                    ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableInstance.rows.map((row) => {
                tableInstance.prepareRow(row);
                return (
                  <tr key={row.id} {...row.getRowProps()} style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {row.cells.map((cell, index) => (
                      <td key={index} {...cell.getCellProps()} style={{ padding: '10px', border: '1px solid #ddd' }}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {references.split(';').length > referencesToShow && (
            <button onClick={handleShowMoreReferences} style={{ marginLeft: '10px' }}>
              Show more references
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CitedReferences;