import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import squarify from 'squarify';
import { Tooltip } from '../common/Tooltip';
import { ChevronRight } from 'lucide-react';

const DEEP_SEA_PALETTE = {
  cell: ['#1B263B', '#415A77', '#778DA9'],
  border: '#0D1B2A',
  text: '#E0E1DD',
};

const Breadcrumb = ({ path, onNavigate }) => (
  <nav className="p-2 flex items-center text-sm text-gray-400 bg-gray-800/20">
    {path.map((part, index) => (
      <React.Fragment key={part}>
        <button
          onClick={() => onNavigate(index)}
          className="hover:text-white transition-colors"
          aria-label={`Navigate to ${part}`}
        >
          {part}
        </button>
        {index < path.length - 1 && <ChevronRight size={16} className="mx-1" />}
      </React.Fragment>
    ))}
  </nav>
);

const Treemap = ({ data, width, height, colorBy, labelField, onSelect }) => {
  const [currentNode, setCurrentNode] = useState(data);
  const [path, setPath] = useState([data[labelField]]);
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    setCurrentNode(data);
    setPath([data[labelField]]);
  }, [data, labelField]);

  const totalValue = useMemo(
    () => currentNode.children?.reduce((sum, child) => sum + child.value, 0) || 0,
    [currentNode]
  );

  useEffect(() => {
    if (currentNode && currentNode.children && currentNode.children.length > 0) {
      const sortedChildren = [...currentNode.children].sort((a, b) => b.value - a.value);

      const squarifiedLayout = squarify(
        sortedChildren.map(c => ({ value: c.value })),
        { x0: 0, y0: 0, x1: width, y1: height }
      );

      const enrichedLayout = squarifiedLayout.map((node, index) => ({
        ...sortedChildren[index],
        ...node,
      }));

      setLayout(enrichedLayout);
    } else {
      setLayout([]);
    }
  }, [currentNode, width, height]);

  const handleCellClick = (node) => {
    onSelect(node);
    if (node.children && node.children.length > 0) {
      setCurrentNode(node);
      setPath([...path, node[labelField]]);
    }
  };

  const handleBreadcrumbNavigate = (index) => {
    let targetNode = data;
    for (let i = 1; i <= index; i++) {
      targetNode = targetNode.children.find(child => child[labelField] === path[i]);
    }
    setCurrentNode(targetNode);
    setPath(path.slice(0, index + 1));
  };

  const getColor = (node, index) => {
    if (colorBy === 'value') {
      const values = currentNode.children.map(c => c.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (max - min === 0) {
        return DEEP_SEA_PALETTE.cell[0];
      }
      const percent = (node.value - min) / (max - min);
      const colorIndex = Math.min(Math.floor(percent * DEEP_SEA_PALETTE.cell.length), DEEP_SEA_PALETTE.cell.length - 1);
      return DEEP_SEA_PALETTE.cell[colorIndex];
    }
    return DEEP_SEA_PALETTE.cell[index % DEEP_SEA_PALETTE.cell.length];
  };

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {path.length > 1 && (
        <Breadcrumb path={path} onNavigate={handleBreadcrumbNavigate} />
      )}
      <div
        style={{
          width,
          flex: 1,
          position: 'relative',
          background: '#0D1B2A',
          border: `1px solid ${DEEP_SEA_PALETTE.border}`,
        }}
        className="treemap-container"
        aria-label="Treemap visualization"
      >
        {layout.map((node, index) => {
          const cellWidth = node.x1 - node.x0;
          const cellHeight = node.y1 - node.y0;

          return (
            <Tooltip
              key={`${node[labelField]}-${index}`}
              content={
                <div>
                  <strong>{node[labelField]}</strong>
                  <br />
                  Value: {node.value.toLocaleString()}
                  <br />
                  Percentage: {((node.value / totalValue) * 100).toFixed(2)}%
                </div>
              }
            >
              <div
                style={{
                  position: 'absolute',
                  top: node.y0,
                  left: node.x0,
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: getColor(node, index),
                  border: `1px solid ${DEEP_SEA_PALETTE.border}`,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  color: DEEP_SEA_PALETTE.text,
                  transition: 'all 0.3s ease-in-out',
                }}
                className="treemap-cell hover:brightness-110"
                role="button"
                tabIndex={0}
                onClick={() => handleCellClick(node)}
                onKeyPress={(e) => e.key === 'Enter' && handleCellClick(node)}
              >
                {cellWidth > 50 && cellHeight > 20 && (
                  <div className="p-1 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {node[labelField]}
                  </div>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

Treemap.propTypes = {
  data: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  colorBy: PropTypes.oneOf(['category', 'value']),
  labelField: PropTypes.string,
  onSelect: PropTypes.func,
};

Treemap.defaultProps = {
  colorBy: 'category',
  labelField: 'name',
  onSelect: () => {},
};

export default Treemap;
