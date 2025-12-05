
import React from 'react';
import Accordion from './Accordion';
import AccordionItem from './AccordionItem';
import { Settings, HelpCircle, Briefcase } from 'lucide-react';
import { useState } from 'react';

const AccordionExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const faqItems = [
    {
      id: '1',
      title: 'How does trading work?',
      content: (
        <p>
          In EVE Online, trading is the act of buying items at a low price and
          selling them at a higher price to make a profit. This can be done at
          trade hubs, which are stations with high player traffic.
        </p>
      ),
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      id: '2',
      title: 'What are broker fees?',
      content: (
        <p>
          Broker fees are a percentage of the total order value that is paid to
          the station owner when you place a buy or sell order. These fees can be
          reduced by training the Broker Relations skill.
        </p>
      ),
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      id: '3',
      title: 'This item is disabled',
      content: <p>You should not be able to see this.</p>,
      disabled: true,
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  const settingsItems = [
    {
      id: 's1',
      title: 'General Settings',
      content: <div>Some general settings go here.</div>,
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 's2',
      title: 'Trade Settings',
      content: <div>Trade specific settings.</div>,
      icon: <Briefcase className="w-5 h-5" />,
    },
  ];

  return (
    <div className="p-4 bg-space-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Accordion Component Examples</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Default Variant</h2>
        <Accordion items={faqItems} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Card Variant (Allow Multiple)</h2>
        <Accordion
          items={settingsItems}
          allowMultiple
          variant="card"
          defaultExpanded={['s1']}
        />
      </div>

      <div className='mb-8'>
        <h2 className="text-xl font-semibold mb-2">Flush Variant</h2>
        <Accordion items={faqItems} variant="flush" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Standalone AccordionItem</h2>
        <AccordionItem
          id="standalone"
          title="Standalone Item"
          content={<p>This is a standalone accordion item.</p>}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          variant="card"
        />
      </div>
    </div>
  );
};

export default AccordionExample;
