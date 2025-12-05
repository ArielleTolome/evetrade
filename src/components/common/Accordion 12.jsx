
import React, { useState, useCallback, useMemo, createRef } from 'react';
import PropTypes from 'prop-types';
import AccordionItem from './AccordionItem';

const Accordion = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  variant = 'default',
}) => {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);
  const itemRefs = useMemo(() => items.map(() => createRef()), [items]);

  const handleToggle = useCallback(
    (id) => {
      setExpandedItems((prev) => {
        if (allowMultiple) {
          return prev.includes(id)
            ? prev.filter((item) => item !== id)
            : [...prev, id];
        }
        return prev.includes(id) ? [] : [id];
      });
    },
    [allowMultiple]
  );

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      itemRefs[nextIndex].current.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      itemRefs[prevIndex].current.focus();
    }
  };

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={item.id} onKeyDown={(e) => handleKeyDown(e, index)}>
          <AccordionItem
            ref={itemRefs[index]}
            {...item}
            isOpen={expandedItems.includes(item.id)}
            onToggle={handleToggle}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
};

Accordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  allowMultiple: PropTypes.bool,
  defaultExpanded: PropTypes.arrayOf(PropTypes.string),
  variant: PropTypes.oneOf(['default', 'card', 'flush']),
};

export default Accordion;
