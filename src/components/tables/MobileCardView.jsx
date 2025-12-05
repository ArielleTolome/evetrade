import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
// eslint-disable-next-line no-unused-vars -- animated is used in JSX as <animated.div>
import { animated, useSpring, useTransition } from '@react-spring/web';
import { Loader, Trash2, PlusCircle } from 'lucide-react';

const MobileCardView = ({
  data,
  cardRenderer,
  columns,
  onCardClick,
  onAddToWatchlist,
  onDismiss,
  onRefresh,
  onLoadMore,
  hasMore,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);

  // Pull to refresh
  const [{ y }, api] = useSpring(() => ({ y: 0 }));
  const bind = useDrag(
    ({ down, movement: [, my], pulling }) => {
      if (pulling && !isRefreshing) {
        setIsRefreshing(true);
        onRefresh().then(() => {
          setIsRefreshing(false);
          api.start({ y: 0 });
        });
      }
      api.start({ y: down ? my : 0, immediate: down });
    },
    { from: () => [0, y.get()], axis: 'y' }
  );

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 1 }
    );

    const lastCard = scrollContainerRef.current?.querySelector('.card:last-child');
    if (lastCard) {
      observer.observe(lastCard);
    }

    return () => {
      if (lastCard) {
        observer.unobserve(lastCard);
      }
    };
  }, [data, hasMore, onLoadMore]);

  // Animation transitions - must be called before any early returns
  const transitions = useTransition(data || [], {
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    keys: item => item.id,
  });

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <div className="text-4xl mb-4 opacity-20">📊</div>
        <p className="text-lg">No data available</p>
      </div>
    );
  }

  // Default card renderer if none is provided
  const defaultCardRenderer = (row) => {
    const primaryInfo = columns.length > 0 ? row[columns[0].key] : 'No Title';
    const keyMetrics = columns.slice(1, 4);
    const secondaryInfo = columns.slice(4);

    return (
      <div
        className="bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-lg p-4"
      >
        <h3 className="text-lg font-bold text-text-primary mb-2">{primaryInfo}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {keyMetrics.map(col => (
            <div key={col.key}>
              <div className="text-sm text-text-secondary">{col.label}</div>
              <div className="text-md text-text-primary">{row[col.key]}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-text-secondary">
          {secondaryInfo.map(col => (
            <span key={col.key} className="mr-4">
              <strong>{col.label}:</strong> {row[col.key]}
            </span>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          {/* Action buttons can be added here */}
        </div>
      </div>
    );
  };

  const Card = ({ row }) => {
    const [{ x, bg, scale: _scale }, api] = useSpring(() => ({
      x: 0,
      scale: 1,
      bg: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)',
    }));

    const bind = useDrag(
      ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
        const trigger = vx > 0.2;
        const dir = xDir < 0 ? -1 : 1;
        if (!down && trigger) {
          const action = dir === 1 ? onAddToWatchlist : onDismiss;
          action(row);
        }

        api.start({
          x: down ? mx : 0,
          scale: down ? 1.05 : 1,
          bg: `linear-gradient(${dir === 1 ? 90 : -90}deg, ${
            dir === 1 ? '#8BC6EC' : '#9599E2'
          } 0%, #8BC6EC 100%)`,
        });
      },
      {
        filterTaps: true,
        rubberband: true,
      }
    );

    const avSize = x.to({
      map: Math.abs,
      range: [50, 100],
      output: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <animated.div
        {...bind()}
        className="relative"
        style={{ x, touchAction: 'pan-y' }}
      >
        <animated.div
          className="absolute top-0 left-0 h-full w-full flex items-center justify-between p-4"
          style={{ background: bg }}
        >
          <animated.div style={{ scale: avSize }}>
            <PlusCircle size={40} color="white" />
          </animated.div>
          <animated.div style={{ scale: avSize }}>
            <Trash2 size={40} color="white" />
          </animated.div>
        </animated.div>
        <div className="relative" onClick={() => onCardClick && onCardClick(row)}>
          {cardRenderer ? cardRenderer(row) : defaultCardRenderer(row)}
        </div>
      </animated.div>
    );
  };

  return (
    <div ref={scrollContainerRef} className="p-4 space-y-4 overflow-y-auto" {...bind()}>
      <animated.div style={{ y }} className="flex justify-center items-center">
        {isRefreshing && <Loader className="animate-spin" />}
      </animated.div>
      {transitions((style, item) => (
        <animated.div style={style} className="card">
          <Card row={item} />
        </animated.div>
      ))}
      {hasMore && (
        <div className="text-center py-4">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MobileCardView;
